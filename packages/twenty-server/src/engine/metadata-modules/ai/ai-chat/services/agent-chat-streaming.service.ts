import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { generateId } from 'ai';
import {
  type ExtendedFileUIPart,
  type ExtendedUIMessagePart,
  isExtendedFileUIPart,
} from 'twenty-shared/ai';
import { FileFolder } from 'twenty-shared/types';
import { In, Like, type Repository } from 'typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  AgentMessageRole,
  AgentMessageStatus,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { mapDBPartsToUIMessageParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapDBPartsToUIMessageParts';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsingContext.type';
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
  fileIds?: string[];
};

@Injectable()
export class AgentChatStreamingService {
  private readonly logger = new Logger(AgentChatStreamingService.name);

  constructor(
    @InjectRepository(AgentChatThreadEntity)
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    @InjectMessageQueue(MessageQueue.aiStreamQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly agentChatService: AgentChatService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async streamAgentChat({
    threadId,
    userWorkspaceId,
    workspace,
    text,
    browsingContext,
    modelId,
    messageId,
    fileIds,
  }: StreamAgentChatOptions): Promise<{ streamId: string; messageId: string }> {
    const thread = await this.threadRepository.findOne({
      where: {
        id: threadId,
        userWorkspaceId,
      },
    });

    if (!thread) {
      throw new AiException(
        'Thread not found',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }

    const fileParts = await this.buildFilePartsFromIds(fileIds, workspace.id);

    const userMessageParts: ExtendedUIMessagePart[] = [
      { type: 'text' as const, text },
      ...fileParts,
    ];

    const savedUserMessage = await this.agentChatService.addMessage({
      threadId,
      id: messageId,
      uiMessage: {
        role: AgentMessageRole.USER,
        parts: userMessageParts,
      },
      workspaceId: workspace.id,
    });

    const previousMessages = await this.loadMessagesFromDB(
      threadId,
      userWorkspaceId,
      workspace.id,
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
        lastUserMessageParts: userMessageParts,
        hasTitle: !!thread.title,
        conversationSizeTokens: thread.conversationSize,
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
    const fileParts = (nextQueued.parts ?? [])
      .filter((part) => part.type === 'file')
      .map(
        (part): ExtendedFileUIPart => ({
          type: 'file',
          mediaType: part.file?.mimeType ?? 'application/octet-stream',
          filename: part.fileFilename ?? '',
          url: '',
          fileId: part.fileId ?? '',
        }),
      );

    if (messageText === '' && fileParts.length === 0) {
      await this.agentChatService.deleteQueuedMessage(nextQueued.id);

      return;
    }

    const turnId = await this.agentChatService.promoteQueuedMessage(
      nextQueued.id,
      threadId,
      workspaceId,
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

    const [uiMessages, thread] = await Promise.all([
      this.loadMessagesFromDB(threadId, userWorkspaceId, workspaceId),
      this.threadRepository.findOneByOrFail({ id: threadId }),
    ]);

    const streamId = generateId();

    const lastUserMessageParts: ExtendedUIMessagePart[] = [
      ...(messageText !== ''
        ? [{ type: 'text' as const, text: messageText }]
        : []),
      ...fileParts,
    ];

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
        lastUserMessageParts,
        hasTitle,
        conversationSizeTokens: thread.conversationSize,
        existingTurnId: turnId,
      },
    );

    await this.threadRepository.update(threadId, {
      activeStreamId: streamId,
    });
  }

  private async loadMessagesFromDB(
    threadId: string,
    userWorkspaceId: string,
    workspaceId: string,
  ) {
    const allMessages = await this.agentChatService.getMessagesForThread(
      threadId,
      userWorkspaceId,
    );

    return allMessages
      .filter((message) => message.status !== AgentMessageStatus.QUEUED)
      .map((message) => ({
        id: message.id,
        role: message.role as 'user' | 'assistant' | 'system',
        parts: mapDBPartsToUIMessageParts(message.parts ?? []).map((part) => {
          if (isExtendedFileUIPart(part as Record<string, unknown>)) {
            const filePart = part as ExtendedFileUIPart;

            return {
              ...filePart,
              url: this.fileUrlService.signFileByIdUrl({
                fileId: filePart.fileId,
                workspaceId,
                fileFolder: FileFolder.AgentChat,
              }),
            } as ExtendedFileUIPart;
          }

          return part;
        }),
        createdAt: message.createdAt,
      }));
  }

  private async buildFilePartsFromIds(
    fileIds: string[] | undefined,
    workspaceId: string,
  ): Promise<ExtendedUIMessagePart[]> {
    if (!fileIds || fileIds.length === 0) {
      return [];
    }

    const files = await this.fileRepository.find({
      where: {
        id: In(fileIds),
        workspaceId,
        path: Like(`%/${FileFolder.AgentChat}/%`),
      },
    });

    return files.map(
      (file): ExtendedFileUIPart => ({
        type: 'file' as const,
        mediaType: file.mimeType,
        filename: file.path.split('/').pop() ?? file.path,
        url: '',
        fileId: file.id,
      }),
    );
  }
}
