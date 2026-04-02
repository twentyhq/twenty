import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { generateId } from 'ai';
import { type Repository } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsingContext.type';
import {
  AgentMessageRole,
  AgentMessageStatus,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { mapDBPartsToUIMessageParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapDBPartsToUIMessageParts';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { STREAM_AGENT_CHAT_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat-job-name.constant';
import { type StreamAgentChatJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat-job.types';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';

export type StreamAgentChatOptions = {
  threadId: string;
  userWorkspaceId: string;
  workspace: WorkspaceEntity;
  text: string;
  browsingContext: BrowsingContextType | null;
  modelId?: string;
  messageId?: string;
};

@Injectable()
export class AgentChatStreamingService {
  private readonly logger = new Logger(AgentChatStreamingService.name);

  constructor(
    @InjectRepository(AgentChatThreadEntity)
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
    @InjectMessageQueue(MessageQueue.aiStreamQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly agentChatService: AgentChatService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
  ) {}

  async streamAgentChat({
    threadId,
    userWorkspaceId,
    workspace,
    text,
    browsingContext,
    modelId,
    messageId,
  }: StreamAgentChatOptions): Promise<{ streamId: string; messageId: string }> {
    const thread = await this.threadRepository.findOne({
      where: {
        id: threadId,
        userWorkspaceId,
      },
    });

    if (!thread) {
      throw new AgentException(
        'Thread not found',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    const savedUserMessage = await this.agentChatService.addMessage({
      threadId,
      id: messageId,
      uiMessage: {
        role: AgentMessageRole.USER,
        parts: [{ type: 'text' as const, text }],
      },
    });

    const previousMessages = await this.loadMessagesFromDB(
      threadId,
      userWorkspaceId,
    );

    const streamId = generateId();

    await this.messageQueueService.add<StreamAgentChatJobData>(
      STREAM_AGENT_CHAT_JOB_NAME,
      {
        threadId: thread.id,
        streamId,
        userWorkspaceId,
        workspaceId: workspace.id,
        messages: previousMessages,
        browsingContext,
        modelId,
        lastUserMessageText: text,
        lastUserMessageParts: [{ type: 'text', text }],
        hasTitle: !!thread.title,
        existingTurnId: savedUserMessage.turnId ?? undefined,
      },
    );

    await this.threadRepository.update(thread.id, {
      activeStreamId: streamId,
    });

    return { streamId, messageId: savedUserMessage.id };
  }

  async flushNextQueuedMessage(
    threadId: string,
    userWorkspaceId: string,
    workspaceId: string,
    hasTitle: boolean,
  ): Promise<void> {
    const queuedMessages =
      await this.agentChatService.getQueuedMessages(threadId);

    const nextQueued = queuedMessages[0];

    if (!nextQueued) {
      return;
    }

    const textPart = nextQueued.parts?.find((part) => part.type === 'text');
    const messageText = textPart?.textContent ?? '';

    if (messageText === '') {
      await this.agentChatService.deleteQueuedMessage(nextQueued.id);

      return;
    }

    const turnId = await this.agentChatService.promoteQueuedMessage(
      nextQueued.id,
      threadId,
    );

    if (turnId === null) {
      return;
    }

    await this.eventPublisherService.publish({
      threadId,
      workspaceId,
      event: { type: 'queue-updated' },
    });

    await this.eventPublisherService.publish({
      threadId,
      workspaceId,
      event: { type: 'message-persisted', messageId: nextQueued.id },
    });

    const uiMessages = await this.loadMessagesFromDB(threadId, userWorkspaceId);

    const streamId = generateId();

    await this.messageQueueService.add<StreamAgentChatJobData>(
      STREAM_AGENT_CHAT_JOB_NAME,
      {
        threadId,
        streamId,
        userWorkspaceId,
        workspaceId,
        messages: uiMessages,
        browsingContext: null,
        lastUserMessageText: messageText,
        lastUserMessageParts: [{ type: 'text', text: messageText }],
        hasTitle,
        existingTurnId: turnId,
      },
    );

    await this.threadRepository.update(threadId, {
      activeStreamId: streamId,
    });
  }

  private async loadMessagesFromDB(threadId: string, userWorkspaceId: string) {
    const allMessages = await this.agentChatService.getMessagesForThread(
      threadId,
      userWorkspaceId,
    );

    return allMessages
      .filter((message) => message.status !== AgentMessageStatus.QUEUED)
      .map((message) => ({
        id: message.id,
        role: message.role as 'user' | 'assistant' | 'system',
        parts: mapDBPartsToUIMessageParts(message.parts ?? []),
        createdAt: message.createdAt,
      }));
  }
}
