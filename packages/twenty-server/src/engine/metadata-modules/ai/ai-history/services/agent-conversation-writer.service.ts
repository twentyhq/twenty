import { Injectable } from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IsNull } from 'typeorm';

import { type AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { mapUIMessagePartsToPersistedDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-ui-message-parts-to-persisted-db-parts.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Injectable()
export class AgentConversationWriterService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
  ) {}

  async insertTurn({
    workspaceId,
    threadId,
    agentId,
    id,
  }: {
    workspaceId: string;
    threadId: string;
    agentId: string | null;
    id?: string;
  }): Promise<string> {
    const turnInsertResult = await this.turnRepository.insert(workspaceId, {
      ...(isDefined(id) ? { id } : {}),
      threadId,
      agentId,
    });

    return (id ?? turnInsertResult.identifiers[0].id) as string;
  }

  // The message and its parts are written together, so a message that
  // exists is complete. A message that awaits an answer also takes the
  // thread's single pending slot in the same write, and fails if another
  // message holds it.
  async insertMessage({
    workspaceId,
    id,
    threadId,
    turnId,
    role,
    agentId,
    senderUserWorkspaceId,
    senderApplicationId,
    isHidden,
    isAwaitingAnswer,
    processedAt,
    parts,
  }: {
    workspaceId: string;
    id?: string;
    threadId: string;
    turnId: string;
    role: AgentMessageRole;
    agentId: string | null;
    senderUserWorkspaceId: string | null;
    senderApplicationId?: string | null;
    isHidden?: boolean;
    isAwaitingAnswer?: boolean;
    processedAt?: Date;
    parts: ExtendedUIMessagePart[];
  }): Promise<string> {
    const messageId = id ?? randomUUID();

    await this.messageRepository.transaction(workspaceId, async (scope) => {
      await scope.insert('agentMessage', {
        id: messageId,
        threadId,
        turnId,
        role,
        agentId,
        processedAt: (processedAt ?? new Date()).toISOString(),
        ...(isDefined(senderUserWorkspaceId) ? { senderUserWorkspaceId } : {}),
        ...(isDefined(senderApplicationId) ? { senderApplicationId } : {}),
        ...(isDefined(isHidden) ? { isHidden } : {}),
      });

      const dbParts = mapUIMessagePartsToPersistedDBParts(
        parts,
        messageId,
        workspaceId,
      );

      if (dbParts.length > 0) {
        await scope.insert('agentMessagePart', dbParts);
      }

      if (isAwaitingAnswer !== true) {
        return;
      }

      const claimedThreadCount = await scope.update(
        'agentChatThread',
        { id: threadId, pendingQuestionMessageId: IsNull() },
        { pendingQuestionMessageId: messageId },
      );

      if (claimedThreadCount === 0) {
        throw new AiException(
          'The conversation is waiting for an answer to an earlier request',
          AiExceptionCode.THREAD_AWAITING_ANSWER,
        );
      }
    });

    return messageId;
  }

  async markAwaitingAnswer({
    workspaceId,
    threadId,
    messageId,
  }: {
    workspaceId: string;
    threadId: string;
    messageId: string;
  }): Promise<void> {
    await this.threadRepository.update(
      workspaceId,
      { id: threadId },
      { pendingQuestionMessageId: messageId },
    );
  }
}
