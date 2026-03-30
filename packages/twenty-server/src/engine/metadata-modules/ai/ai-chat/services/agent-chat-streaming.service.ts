import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { generateId, UI_MESSAGE_STREAM_HEADERS } from 'ai';
import { type Response } from 'express';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
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
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import {
  STREAM_AGENT_CHAT_JOB_NAME,
  type StreamAgentChatJobData,
} from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat.job';

import { AgentChatResumableStreamService } from './agent-chat-resumable-stream.service';

export type StreamAgentChatOptions = {
  threadId: string;
  userWorkspaceId: string;
  workspace: WorkspaceEntity;
  response: Response;
  messages: ExtendedUIMessage[];
  browsingContext: BrowsingContextType | null;
  modelId?: string;
};

// Max time to wait for the BullMQ worker to create the resumable stream
// in Redis before giving up and returning an error to the client.
const STREAM_READY_TIMEOUT_MS = 10_000;
const STREAM_READY_POLL_INTERVAL_MS = 100;

@Injectable()
export class AgentChatStreamingService {
  private readonly logger = new Logger(AgentChatStreamingService.name);

  constructor(
    @InjectRepository(AgentChatThreadEntity)
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
    @InjectMessageQueue(MessageQueue.aiStreamQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly resumableStreamService: AgentChatResumableStreamService,
  ) {}

  async streamAgentChat({
    threadId,
    userWorkspaceId,
    workspace,
    messages,
    browsingContext,
    response,
    modelId,
  }: StreamAgentChatOptions) {
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

    const streamId = generateId();
    const lastUserMessage = messages[messages.length - 1];
    const lastUserText =
      lastUserMessage?.parts.find((part) => part.type === 'text')?.text ?? '';

    await this.messageQueueService.add<StreamAgentChatJobData>(
      STREAM_AGENT_CHAT_JOB_NAME,
      {
        threadId: thread.id,
        streamId,
        userWorkspaceId,
        workspaceId: workspace.id,
        messages,
        browsingContext,
        modelId,
        lastUserMessageText: lastUserText,
        lastUserMessageParts: lastUserMessage?.parts ?? [],
      },
    );

    await this.threadRepository.update(thread.id, {
      activeStreamId: streamId,
    });

    try {
      const nodeReadable = await this.waitForResumableStream(streamId);

      if (!nodeReadable) {
        this.logger.error(
          `Stream ${streamId} did not become available within timeout`,
        );
        response.status(500).json({ error: 'Stream failed to start' });

        return;
      }

      response.writeHead(200, UI_MESSAGE_STREAM_HEADERS);
      nodeReadable.pipe(response);
    } catch (error) {
      response.end();
      throw error;
    }
  }

  private async waitForResumableStream(streamId: string) {
    const maxAttempts = Math.ceil(
      STREAM_READY_TIMEOUT_MS / STREAM_READY_POLL_INTERVAL_MS,
    );

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const readable =
        await this.resumableStreamService.resumeExistingStreamAsNodeReadable(
          streamId,
        );

      if (readable) {
        return readable;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, STREAM_READY_POLL_INTERVAL_MS),
      );
    }

    return null;
  }
}
