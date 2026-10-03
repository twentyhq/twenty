import { Injectable } from '@nestjs/common';

import {
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
  isExtendedFileUIPart,
} from 'twenty-shared/ai';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { finalizeDanglingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/finalize-dangling-tool-parts.util';
import { mapDBPartsToUIMessageParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-db-parts-to-ui-message-parts.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentConversationActor } from 'src/engine/metadata-modules/ai/ai-history/types/agent-conversation-actor.type';
import { findTurnIdsActedByOthers } from 'src/engine/metadata-modules/ai/ai-history/utils/find-turn-ids-acted-by-others.util';

@Injectable()
export class AgentConversationReaderService {
  constructor(
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async loadMessages({
    workspaceId,
    threadId,
    actor,
  }: {
    workspaceId: string;
    threadId: string;
    actor?: AgentConversationActor;
  }): Promise<ExtendedUIMessage[]> {
    const messages = await this.messageRepository.find(workspaceId, {
      where: { threadId },
      order: {
        processedAt: { order: 'ASC', nulls: 'NULLS LAST' },
        createdAt: 'ASC',
      },
      relations: ['parts', 'parts.file'],
    });

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
