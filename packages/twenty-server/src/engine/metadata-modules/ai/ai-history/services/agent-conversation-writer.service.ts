import { Injectable } from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { type AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import { type AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { mapUIMessagePartsToPersistedDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-ui-message-parts-to-persisted-db-parts.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';

// Writes conversations that are not streamed from a chat: the messages a
// workflow step or an application posts, whoever ends up answering them.
@Injectable()
export class AgentConversationWriterService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartEntity>,
  ) {}

  async insertTurn({
    workspaceId,
    threadId,
    agentId,
  }: {
    workspaceId: string;
    threadId: string;
    agentId: string | null;
  }): Promise<string> {
    const turnInsertResult = await this.turnRepository.insert(workspaceId, {
      threadId,
      agentId,
    });

    return turnInsertResult.identifiers[0].id as string;
  }

  async insertMessage({
    workspaceId,
    threadId,
    turnId,
    role,
    agentId,
    senderUserWorkspaceId,
    senderApplicationId,
    isHidden,
    parts,
  }: {
    workspaceId: string;
    threadId: string;
    turnId: string;
    role: AgentMessageRole;
    agentId: string | null;
    senderUserWorkspaceId: string | null;
    senderApplicationId?: string | null;
    isHidden?: boolean;
    parts: ExtendedUIMessagePart[];
  }): Promise<string> {
    const messageId = randomUUID();

    await this.messageRepository.insert(workspaceId, {
      id: messageId,
      threadId,
      turnId,
      role,
      agentId,
      processedAt: new Date().toISOString(),
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
      await this.messagePartRepository.insert(
        workspaceId,
        dbParts as QueryDeepPartialEntity<AgentMessagePartEntity>[],
      );
    }

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
