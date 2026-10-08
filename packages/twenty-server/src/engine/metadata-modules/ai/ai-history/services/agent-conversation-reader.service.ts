import { Injectable } from '@nestjs/common';

import {
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
  isExtendedFileUIPart,
} from 'twenty-shared/ai';
import { FileFolder } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { finalizeDanglingToolParts } from 'src/engine/metadata-modules/ai/ai-history/utils/finalize-dangling-tool-parts.util';
import { mapDBPartsToUIMessageParts } from 'src/engine/metadata-modules/ai/ai-history/utils/map-db-parts-to-ui-message-parts.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentHistoryUpgradeFenceService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-upgrade-fence.service';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { type AgentConversationActor } from 'src/engine/metadata-modules/ai/ai-history/types/agent-conversation-actor.type';
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
    private readonly upgradeFenceService: AgentHistoryUpgradeFenceService,
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
      this.upgradeFenceService
        .hasUpgradedAgentHistory(workspaceId)
        .then((hasAgentTurnRunFields) =>
          hasAgentTurnRunFields
            ? this.turnRepository.find(workspaceId, {
                where: { threadId, status: AgentTurnStatus.FAILED },
                select: ['id'],
              })
            : [],
        ),
    ]);

    // a failed run is kept on record but leaves the conversation as it was
    const failedTurnIds = new Set(failedTurns.map(({ id }) => id));
    const messages = threadMessages.filter(
      ({ turnId }) => !isDefined(turnId) || !failedTurnIds.has(turnId),
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
            ? parts.filter((part) => part.type === 'text')
            : await this.signFileParts({ workspaceId, parts }),
        };
      }),
    );
  }

  private signFileParts({
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
