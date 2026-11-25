import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
  isExtendedFileUIPart,
} from 'twenty-shared/ai';
import { FileFolder } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, IsNull, Not, Or } from 'typeorm';

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
import { type AgentConversationViewer } from 'src/engine/metadata-modules/ai/ai-history/types/agent-conversation-viewer.type';
import { type AgentConversationMessageText } from 'src/engine/metadata-modules/ai/ai-history/types/agent-conversation-message-text.type';
import { filterPartsOfTurnActedByOthers } from 'src/engine/metadata-modules/ai/ai-history/utils/filter-parts-of-turn-acted-by-others.util';
import { isAgentTurnOpenedByOtherMember } from 'src/engine/metadata-modules/ai/ai-history/utils/is-agent-turn-opened-by-other-member.util';

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
    const failedTurns = await this.turnRepository.find(workspaceId, {
      where: { threadId, status: AgentTurnStatus.FAILED },
      select: ['id'],
    });
    const recentMessages = await this.messageRepository.find(workspaceId, {
      where: {
        threadId,
        role: In([AgentMessageRole.USER, AgentMessageRole.ASSISTANT]),
        status: Not(AgentMessageStatus.QUEUED),
        ...(isNonEmptyArray(failedTurns) && {
          turnId: Or(IsNull(), Not(In(failedTurns.map(({ id }) => id)))),
        }),
      },
      select: ['id', 'role'],
      order: {
        processedAt: { order: 'DESC', nulls: 'NULLS FIRST' },
        createdAt: 'DESC',
        id: 'DESC',
      },
      take: limit,
    });
    const textParts = await this.messagePartRepository.find(workspaceId, {
      where: {
        messageId: In(recentMessages.map(({ id }) => id)),
        type: 'text',
      },
      select: ['messageId', 'textContent'],
      order: { orderIndex: 'ASC' },
    });

    return recentMessages.reverse().flatMap(({ id, role }) => {
      if (
        role !== AgentMessageRole.USER &&
        role !== AgentMessageRole.ASSISTANT
      ) {
        return [];
      }

      const text = textParts
        .filter(
          ({ messageId, textContent }) =>
            messageId === id && isNonEmptyString(textContent?.trim()),
        )
        .map(({ textContent }) => textContent)
        .join('\n\n');

      return isNonEmptyString(text) ? [{ role, text }] : [];
    });
  }

  async loadMessages({
    workspaceId,
    threadId,
    viewer,
  }: {
    workspaceId: string;
    threadId: string;
    // the history's rule, so a run reads the conversation as its caller reads it
    viewer?: AgentConversationViewer;
  }): Promise<ExtendedUIMessage[]> {
    const [threadMessages, turns] = await Promise.all([
      this.messageRepository.find(workspaceId, {
        where: { threadId },
        order: {
          processedAt: { order: 'ASC', nulls: 'NULLS LAST' },
          createdAt: 'ASC',
        },
        relations: ['parts', 'parts.file'],
      }),
      this.turnRepository.find(workspaceId, { where: { threadId } }),
    ]);

    // a failed run is kept on record but leaves the conversation as it was, and a chat message
    // queued behind a stream is not sent yet
    const failedTurnIds = new Set(
      turns
        .filter(({ status }) => status === AgentTurnStatus.FAILED)
        .map(({ id }) => id),
    );
    const messages = threadMessages.filter(
      ({ turnId, status }) =>
        status !== AgentMessageStatus.QUEUED &&
        (!isDefined(turnId) || !failedTurnIds.has(turnId)),
    );

    const turnIdsActedByOthers = new Set(
      isDefined(viewer)
        ? turns
            .filter(({ createdBy }) =>
              isAgentTurnOpenedByOtherMember({ createdBy, ...viewer }),
            )
            .map(({ id }) => id)
        : [],
    );

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
