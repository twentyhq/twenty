import { Injectable, Logger } from '@nestjs/common';

import { generateId } from 'ai';
import {
  type ExtendedFileUIPart,
  type ExtendedUIMessagePart,
  isExtendedFileUIPart,
} from 'twenty-shared/ai';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type FindOptionsWhere, In, IsNull, Like, Not } from 'typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  AgentMessageRole,
  AgentMessageStatus,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { mapDBPartsToUIMessageParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapDBPartsToUIMessageParts';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsingContext.type';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { type AgentChatThreadLastStreamError } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-last-stream-error.type';
import { STREAM_AGENT_CHAT_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat-job-name.constant';
import { type StreamAgentChatJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat-job.types';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamHeartbeatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-heartbeat.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { AiChatFileAttachment } from 'src/engine/metadata-modules/ai/ai-chat/types/ai-chat-file-attachment.type';
import { mapErrorToStreamError } from 'src/engine/metadata-modules/ai/ai-chat/utils/map-error-to-stream-error.util';
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
    private readonly streamHeartbeatService: AgentChatStreamHeartbeatService,
    private readonly metricsService: MetricsService,
  ) {}

  async reapDeadStream({
    thread,
    workspaceId,
  }: {
    thread: Pick<AgentChatThreadEntity, 'id' | 'activeStreamId'>;
    workspaceId: string;
  }): Promise<AgentChatThreadLastStreamError | null> {
    if (!isDefined(thread.activeStreamId)) {
      return null;
    }

    if (await this.streamHeartbeatService.isAlive(thread.activeStreamId)) {
      return null;
    }

    const interruptedError: AgentChatThreadLastStreamError = {
      code: AiExceptionCode.STREAM_INTERRUPTED,
      message: 'The response was interrupted before it could finish.',
      failedAt: new Date().toISOString(),
    };

    const reap = await this.threadRepository.update(
      workspaceId,
      { id: thread.id, activeStreamId: thread.activeStreamId },
      { activeStreamId: null, lastStreamError: interruptedError },
    );

    if (!reap.affected) {
      return null;
    }

    this.metricsService.incrementCounterBy({
      key: MetricsKeys.AiChatTurnFailed,
      amount: 1,
      attributes: {
        failure_phase: 'interrupted',
        error_code: interruptedError.code,
      },
    });

    await this.eventPublisherService.resetStreamState(thread.id);
    await this.eventPublisherService
      .publish({
        threadId: thread.id,
        workspaceId,
        event: {
          type: 'stream-error',
          code: interruptedError.code,
          message: interruptedError.message,
        },
      })
      .catch(() => {});

    return interruptedError;
  }

  private async tryClaimStream({
    threadId,
    workspaceId,
    streamId,
    where,
  }: {
    threadId: string;
    workspaceId: string;
    streamId: string;
    where: FindOptionsWhere<AgentChatThreadEntity>;
  }): Promise<boolean> {
    const claim = await this.threadRepository.update(
      workspaceId,
      { id: threadId, activeStreamId: IsNull(), ...where },
      { activeStreamId: streamId, lastStreamError: null },
    );

    if (!claim.affected) {
      return false;
    }

    await this.streamHeartbeatService.markClaimed(streamId);

    return true;
  }

  async streamAgentChat({
    threadId,
    userWorkspaceId,
    workspace,
    text,
    browsingContext,
    modelId,
    messageId,
    fileAttachments,
  }: StreamAgentChatOptions): Promise<
    | {
        queued: false;
        streamId: string;
        messageId: string;
        turnId: string | null;
      }
    | { queued: true; messageId: string }
  > {
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

    const hasQueuedBacklog = await this.agentChatService.hasQueuedMessages({
      threadId,
      workspaceId: workspace.id,
    });

    const streamId = generateId();

    const claimed =
      !hasQueuedBacklog &&
      (await this.tryClaimStream({
        threadId,
        workspaceId: workspace.id,
        streamId,
        where: { pendingQuestionMessageId: IsNull() },
      }));

    if (!claimed) {
      const queuedMessage = await this.agentChatService.queueMessage({
        threadId,
        text,
        id: messageId,
        fileAttachments,
        workspaceId: workspace.id,
        userWorkspaceId,
      });

      if (hasQueuedBacklog) {
        await this.flushNextQueuedMessage(
          threadId,
          userWorkspaceId,
          workspace.id,
          !!thread.title,
        );
      }

      return { queued: true, messageId: queuedMessage.id };
    }

    try {
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

      return {
        queued: false,
        streamId,
        messageId: savedUserMessage.id,
        turnId: savedUserMessage.turnId,
      };
    } catch (error) {
      await this.releaseStreamClaim(threadId, workspace.id, streamId);
      const streamError = mapErrorToStreamError(error);

      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AiChatTurnFailed,
        amount: 1,
        attributes: {
          model: modelId ?? 'unknown',
          failure_phase: 'enqueue',
          error_code: streamError.code,
        },
      });
      throw error;
    }
  }

  async retryLastFailedTurn({
    threadId,
    userWorkspaceId,
    workspace,
    modelId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspace: WorkspaceEntity;
    modelId?: string;
  }): Promise<{ streamId: string; messageId: string; turnId: string }> {
    const thread = await this.threadRepository.findOne(workspace.id, {
      where: { id: threadId, userWorkspaceId },
    });

    if (!thread) {
      throw new AiException(
        'Thread not found',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }

    if (
      !isDefined(thread.lastStreamError) ||
      isDefined(thread.activeStreamId)
    ) {
      throw new AiException(
        'There is no failed turn to retry on this thread',
        AiExceptionCode.NO_FAILED_TURN_TO_RETRY,
      );
    }

    const streamId = generateId();

    const claimed = await this.tryClaimStream({
      threadId,
      workspaceId: workspace.id,
      streamId,
      where: { lastStreamError: Not(IsNull()) },
    });

    if (!claimed) {
      throw new AiException(
        'There is no failed turn to retry on this thread',
        AiExceptionCode.NO_FAILED_TURN_TO_RETRY,
      );
    }

    try {
      const lastUserMessage =
        await this.agentChatService.findLatestSentUserMessage({
          threadId,
          workspaceId: workspace.id,
        });

      if (!isDefined(lastUserMessage) || !isDefined(lastUserMessage.turnId)) {
        throw new AiException(
          'There is no failed turn to retry on this thread',
          AiExceptionCode.NO_FAILED_TURN_TO_RETRY,
        );
      }

      await this.agentChatService.deleteAssistantMessagesForTurn({
        turnId: lastUserMessage.turnId,
        workspaceId: workspace.id,
      });

      const messages = await this.loadMessagesFromDB(
        threadId,
        userWorkspaceId,
        workspace.id,
      );

      const retriedMessage = messages[messages.length - 1];

      if (!retriedMessage || retriedMessage.id !== lastUserMessage.id) {
        throw new AiException(
          'There is no failed turn to retry on this thread',
          AiExceptionCode.NO_FAILED_TURN_TO_RETRY,
        );
      }

      const textPart = retriedMessage.parts.find(
        (part) => part.type === 'text',
      );

      await this.messageQueueService.add<StreamAgentChatJobData>(
        STREAM_AGENT_CHAT_JOB_NAME,
        {
          threadId,
          streamId,
          userWorkspaceId,
          workspaceId: workspace.id,
          messages,
          browsingContext: null,
          modelId,
          lastUserMessageText: textPart?.text ?? '',
          lastUserMessageParts: retriedMessage.parts,
          hasTitle: !!thread.title,
          conversationSizeTokens: thread.conversationSize,
          existingTurnId: lastUserMessage.turnId,
        },
      );

      return {
        streamId,
        messageId: lastUserMessage.id,
        turnId: lastUserMessage.turnId,
      };
    } catch (error) {
      await this.releaseStreamClaim(threadId, workspace.id, streamId, {
        lastStreamError: thread.lastStreamError,
      });
      const streamError = mapErrorToStreamError(error);

      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AiChatTurnFailed,
        amount: 1,
        attributes: {
          model: modelId ?? 'unknown',
          failure_phase: 'enqueue',
          error_code: streamError.code,
        },
      });
      throw error;
    }
  }

  async enqueueResumeStream({
    threadId,
    userWorkspaceId,
    workspace,
    turnId,
    streamId,
    modelId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspace: WorkspaceEntity;
    turnId: string | null;
    streamId: string;
    modelId?: string;
  }): Promise<void> {
    const thread = await this.threadRepository.findOneOrFail(workspace.id, {
      where: { id: threadId },
    });

    const messages = await this.loadMessagesFromDB(
      threadId,
      userWorkspaceId,
      workspace.id,
    );

    await this.streamHeartbeatService.markClaimed(streamId);

    await this.messageQueueService.add<StreamAgentChatJobData>(
      STREAM_AGENT_CHAT_JOB_NAME,
      {
        threadId,
        streamId,
        userWorkspaceId,
        workspaceId: workspace.id,
        messages,
        browsingContext: null,
        modelId,
        lastUserMessageText: '',
        lastUserMessageParts: [],
        hasTitle: !!thread.title,
        conversationSizeTokens: thread.conversationSize,
        existingTurnId: turnId ?? undefined,
        isResume: true,
      },
    );
  }

  async flushNextQueuedMessage(
    threadId: string,
    userWorkspaceId: string,
    workspaceId: string,
    hasTitle: boolean,
  ): Promise<void> {
    const threadStatus = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
      select: ['id', 'deletedAt', 'pendingQuestionMessageId'],
    });

    if (!threadStatus || threadStatus.deletedAt) {
      return;
    }

    if (isDefined(threadStatus.pendingQuestionMessageId)) {
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

    const streamId = generateId();

    const claimed = await this.tryClaimStream({
      threadId,
      workspaceId,
      streamId,
      where: { pendingQuestionMessageId: IsNull() },
    });

    if (!claimed) {
      return;
    }

    try {
      const turnId = await this.agentChatService.promoteQueuedMessage({
        messageId: nextQueued.id,
        threadId,
        workspaceId,
      });

      if (turnId === null) {
        await this.releaseStreamClaim(threadId, workspaceId, streamId);

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
    } catch (error) {
      await this.releaseStreamClaim(threadId, workspaceId, streamId);
      const streamError = mapErrorToStreamError(error);

      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AiChatTurnFailed,
        amount: 1,
        attributes: {
          model: 'unknown',
          failure_phase: 'enqueue',
          error_code: streamError.code,
        },
      });
      throw error;
    }
  }

  private async releaseStreamClaim(
    threadId: string,
    workspaceId: string,
    streamId: string,
    restore?: { lastStreamError: AgentChatThreadLastStreamError | null },
  ): Promise<void> {
    await this.threadRepository
      .update(
        workspaceId,
        { id: threadId, activeStreamId: streamId },
        { activeStreamId: null, ...restore },
      )
      .catch((error) => {
        this.logger.error(
          `Failed to release stream claim for thread ${threadId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      });
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
        metadata: { createdAt: message.createdAt.toISOString() },
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
