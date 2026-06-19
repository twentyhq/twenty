import { Injectable, Logger } from '@nestjs/common';

import { generateId } from 'ai';
import {
  type ExtendedFileUIPart,
  type ExtendedUIMessagePart,
  isExtendedFileUIPart,
} from 'twenty-shared/ai';
import { FileFolder } from 'twenty-shared/types';
import { In, Like } from 'typeorm';

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
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsingContext.type';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { STREAM_AGENT_CHAT_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat-job-name.constant';
import { type StreamAgentChatJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat-job.types';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { AiChatFileAttachment } from 'src/engine/metadata-modules/ai/ai-chat/types/ai-chat-file-attachment.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
type StreamAgentChatOptions = {
  threadId: string;
  userWorkspaceId: string;
  workspace: WorkspaceEntity;
  text: string;
  browsingContext: BrowsingContextType | null;
  modelId?: string;
  agentId?: string;
  messageId?: string;
  fileAttachments?: AiChatFileAttachment[];
};

@Injectable()
export class AgentChatStreamingService {
  private readonly logger = new Logger(AgentChatStreamingService.name);

  constructor(
    @InjectWorkspaceScopedRepository(AgentChatThreadEntity)
    private readonly threadRepository: WorkspaceScopedRepository<AgentChatThreadEntity>,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
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
    agentId,
    fileAttachments,
  }: StreamAgentChatOptions): Promise<{ streamId: string; messageId: string }> {
    const thread = await this.threadRepository.findOne(workspace.id, {
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

    const fileParts = await this.buildFilePartsFromAttachments(
      fileAttachments,
      workspace.id,
    );

    const userMessageParts: ExtendedUIMessagePart[] = [
      { type: 'text' as const, text },
      ...fileParts,
    ];

    const savedUserMessage = await this.agentChatService.addMessage({
      threadId,
      id: messageId,
      agentId,
      uiMessage: {
        role: AgentMessageRole.USER,
        parts: userMessageParts,
      },
      workspaceId: workspace.id,
    });

    await this.agentChatService.notifyThreadActivityUpdated({
      threadId,
      userWorkspaceId,
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
        agentId,
        lastUserMessageParts: userMessageParts,
        hasTitle: !!thread.title,
        conversationSizeTokens: thread.conversationSize,
        existingTurnId: savedUserMessage.turnId ?? undefined,
      },
    );

    await this.threadRepository.update(
      workspace.id,
      { id: thread.id },
      { activeStreamId: streamId },
    );

    return { streamId, messageId: savedUserMessage.id };
  }

  async flushNextQueuedMessage(
    threadId: string,
    userWorkspaceId: string,
    workspaceId: string,
    hasTitle: boolean,
  ): Promise<void> {
    const threadStatus = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
      select: ['id', 'deletedAt'],
    });

    if (!threadStatus || threadStatus.deletedAt) {
      return;
    }

    const queuedMessages = await this.agentChatService.getQueuedMessages({
      threadId,
      workspaceId,
    });

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
      await this.agentChatService.deleteQueuedMessage({
        messageId: nextQueued.id,
        workspaceId,
      });

      return;
    }

    const turnId = await this.agentChatService.promoteQueuedMessage({
      messageId: nextQueued.id,
      threadId,
      workspaceId,
    });

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
      this.threadRepository.findOneOrFail(workspaceId, {
        where: { id: threadId },
      }),
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

    await this.threadRepository.update(
      workspaceId,
      { id: threadId },
      { activeStreamId: streamId },
    );
  }

  private async loadMessagesFromDB(
    threadId: string,
    userWorkspaceId: string,
    workspaceId: string,
  ) {
    const allMessages = await this.agentChatService.getMessagesForThread({
      threadId,
      userWorkspaceId,
      workspaceId,
    });

    const filteredMessages = allMessages.filter(
      (message) => message.status !== AgentMessageStatus.QUEUED,
    );

    return Promise.all(
      filteredMessages.map(async (message) => ({
        id: message.id,
        role: message.role as 'user' | 'assistant' | 'system',
        parts: await Promise.all(
          mapDBPartsToUIMessageParts(message.parts ?? []).map(async (part) => {
            if (isExtendedFileUIPart(part as Record<string, unknown>)) {
              const filePart = part as ExtendedFileUIPart;

              return {
                ...filePart,
                url: await this.fileUrlService.signFileByIdUrl({
                  fileId: filePart.fileId,
                  workspaceId,
                  fileFolder: FileFolder.AgentChat,
                }),
              } as ExtendedFileUIPart;
            }

            return part;
          }),
        ),
        createdAt: message.createdAt,
      })),
    );
  }

  private async buildFilePartsFromAttachments(
    fileAttachments: AiChatFileAttachment[] | undefined,
    workspaceId: string,
  ): Promise<ExtendedUIMessagePart[]> {
    if (!fileAttachments || fileAttachments.length === 0) {
      return [];
    }

    const fileIds = fileAttachments.map((attachment) => attachment.id);

    const validFiles = await this.fileRepository.find(workspaceId, {
      where: {
        id: In(fileIds),
        path: Like(`${FileFolder.AgentChat}/%`),
      },
    });

    const validFileIds = new Set(validFiles.map((file) => file.id));

    return fileAttachments
      .filter((attachment) => validFileIds.has(attachment.id))
      .map((attachment): ExtendedFileUIPart => {
        const file = validFiles.find(
          (validFile) => validFile.id === attachment.id,
        );

        return {
          type: 'file' as const,
          mediaType: file?.mimeType ?? 'application/octet-stream',
          filename: attachment.filename,
          url: '',
          fileId: attachment.id,
        };
      });
  }
}
