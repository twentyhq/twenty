import { Injectable } from '@nestjs/common';

import {
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
  isExtendedFileUIPart,
} from 'twenty-shared/ai';
import { FileFolder } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { In } from 'typeorm';

import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { finalizeDanglingToolParts } from 'src/engine/metadata-modules/ai/ai-history/utils/finalize-dangling-tool-parts.util';
import { mapDBPartsToUIMessageParts } from 'src/engine/metadata-modules/ai/ai-history/utils/map-db-parts-to-ui-message-parts.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { type AgentConversationActor } from 'src/engine/metadata-modules/ai/ai-history/types/agent-conversation-actor.type';
import { type AgentConversationMessageText } from 'src/engine/metadata-modules/ai/ai-history/types/agent-conversation-message-text.type';
import { filterPartsOfTurnActedByOthers } from 'src/engine/metadata-modules/ai/ai-history/utils/filter-parts-of-turn-acted-by-others.util';
import { findTurnIdsActedByOthers } from 'src/engine/metadata-modules/ai/ai-history/utils/find-turn-ids-acted-by-others.util';

@Injectable()
export class AgentConversationReaderService {
  constructor(
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnWorkspaceEntity>,
    private readonly fileUrlService: FileUrlService,
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartWorkspaceEntity>,
  ) {}

  // tool call ids are only unique within a conversation
  async findToolPart({
    threadId,
    toolCallId,
    workspaceId,
  }: {
    threadId: string;
    toolCallId: string;
    workspaceId: string;
  }): Promise<Pick<
    AgentMessagePartWorkspaceEntity,
    'id' | 'messageId' | 'toolName' | 'toolInput' | 'toolOutput'
  > | null> {
    const parts = await this.messagePartRepository.find(workspaceId, {
      where: { toolCallId },
      select: ['id', 'messageId', 'toolName', 'toolInput', 'toolOutput'],
    });

    if (!isNonEmptyArray(parts)) {
      return null;
    }

    const message = await this.messageRepository.findOne(workspaceId, {
      where: {
        id: In(parts.map((part) => part.messageId)),
        threadId,
      },
      select: ['id'],
    });

    return (
      parts.find((candidate) => candidate.messageId === message?.id) ?? null
    );
  }

  async loadRecentMessageTexts({
    workspaceId,
    threadId,
    limit,
  }: {
    workspaceId: string;
    threadId: string;
    limit: number;
  }): Promise<AgentConversationMessageText[]> {
    return this.messageRepository.query(workspaceId, ({ manager, table }) =>
      manager.query<AgentConversationMessageText[]>(
        doNotTranslate(`WITH recent_messages AS (
          SELECT message.id, message.role, message."processedAt", message."createdAt"
          FROM ${table('agentMessage')} message
          LEFT JOIN ${table('agentTurn')} message_turn
            ON message_turn.id = message."turnId" AND message_turn."threadId" = message."threadId"
          WHERE message."threadId" = $1
            AND message.role = ANY($2::text[])
            AND message.status IS DISTINCT FROM $3
            AND message_turn.status IS DISTINCT FROM $4
          ORDER BY message."processedAt" DESC NULLS FIRST, message."createdAt" DESC, message.id DESC
          LIMIT $5
        )
        SELECT recent_messages.role,
          COALESCE((
            SELECT part."textContent"
            FROM ${table('agentMessagePart')} part
            WHERE part."messageId" = recent_messages.id AND part.type = $6
              AND part."textContent" ~ '[^[:space:]]'
            ORDER BY part."orderIndex" DESC LIMIT 1
          ), '') AS text
        FROM recent_messages
        ORDER BY "processedAt" ASC NULLS LAST, "createdAt" ASC, id ASC`),
        [
          threadId,
          [AgentMessageRole.USER, AgentMessageRole.ASSISTANT],
          AgentMessageStatus.QUEUED,
          AgentTurnStatus.FAILED,
          limit,
          'text',
        ],
      ),
    );
  }

  async loadMessages({
    workspaceId,
    threadId,
    actor,
  }: {
    workspaceId: string;
    threadId: string;
    actor?: AgentConversationActor;
  }): Promise<ExtendedUIMessage[]> {
    const [threadMessages, failedTurns] = await Promise.all([
      this.messageRepository.find(workspaceId, {
        where: { threadId },
        order: {
          processedAt: { order: 'ASC', nulls: 'NULLS LAST' },
          createdAt: 'ASC',
        },
        relations: ['parts', 'parts.file'],
      }),
      this.turnRepository.find(workspaceId, {
        where: { threadId, status: AgentTurnStatus.FAILED },
        select: ['id'],
      }),
    ]);

    // a failed run is kept on record but leaves the conversation as it was, and a chat message
    // queued behind a stream is not sent yet
    const failedTurnIds = new Set(failedTurns.map(({ id }) => id));
    const messages = threadMessages.filter(
      ({ turnId, status }) =>
        status !== AgentMessageStatus.QUEUED &&
        (!isDefined(turnId) || !failedTurnIds.has(turnId)),
    );

    const turnIdsActedByOthers = isDefined(actor)
      ? findTurnIdsActedByOthers({ messages, actor })
      : new Set<string>();

    return Promise.all(
      messages.map(async (message) => {
        const parts = finalizeDanglingToolParts(
          mapDBPartsToUIMessageParts(message.parts ?? []),
        );
        const isActedByOthers =
          isDefined(message.turnId) && turnIdsActedByOthers.has(message.turnId);

        return {
          id: message.id,
          role: message.role as ExtendedUIMessage['role'],
          parts: isActedByOthers
            ? filterPartsOfTurnActedByOthers(parts)
            : await this.signFileParts({ workspaceId, parts }),
        };
      }),
    );
  }

  signFileParts({
    workspaceId,
    parts,
  }: {
    workspaceId: string;
    parts: ExtendedUIMessagePart[];
  }): Promise<ExtendedUIMessagePart[]> {
    return Promise.all(
      parts.map(async (part) =>
        isExtendedFileUIPart(part)
          ? {
              ...part,
              url: await this.fileUrlService.signFileByIdUrl({
                fileId: part.fileId,
                workspaceId,
                fileFolder: FileFolder.AgentChat,
              }),
            }
          : part,
      ),
    );
  }
}
