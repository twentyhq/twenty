import { Injectable, Logger } from '@nestjs/common';

import { generateId } from 'ai';
import {
  type ExtendedFileUIPart,
  type ExtendedUIMessagePart,
  isExtendedFileUIPart,
} from 'twenty-shared/ai';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Like, Not } from 'typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { STREAM_INTERRUPTED_CODE } from 'src/engine/metadata-modules/ai/ai-chat/constants/stream-interrupted-code.constant';
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
import { AgentChatStreamHeartbeatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-heartbeat.service';
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
  ) {}

  // Detects a stream claim whose job died without cleanup (worker crash,
  // deploy) via the missing heartbeat key, and converts it into a normal
  // failed-turn state so the thread unblocks and Retry works.
  async reapDeadStream({
    thread,
    workspaceId,
  }: {
    thread: Pick<AgentChatThreadEntity, 'id' | 'activeStreamId'>;
    workspaceId: string;
  }): Promise<boolean> {
    if (!isDefined(thread.activeStreamId)) {
      return false;
    }

    if (await this.streamHeartbeatService.isAlive(thread.activeStreamId)) {
      return false;
    }

    const interruptedMessage =
      'The response was interrupted before it could finish.';

    const reap = await this.threadRepository.update(
      workspaceId,
      { id: thread.id, activeStreamId: thread.activeStreamId },
      {
        activeStreamId: null,
        lastStreamError: {
          code: STREAM_INTERRUPTED_CODE,
          message: interruptedMessage,
          failedAt: new Date().toISOString(),
        },
      },
    );

    if (!reap.affected) {
      return false;
    }

    await this.eventPublisherService.resetStreamState(thread.id);
    await this.eventPublisherService
      .publish({
        threadId: thread.id,
        workspaceId,
        event: {
          type: 'stream-error',
          code: STREAM_INTERRUPTED_CODE,
          message: interruptedMessage,
        },
      })
      .catch(() => {});

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
    | { queued: false; streamId: string; messageId: string }
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

    // A halted queue (after a failure or stop) must drain front-first: a new
    // send joins the back and kicks the drain instead of jumping ahead.
    const queuedMessages = await this.agentChatService.getQueuedMessages({
      threadId,
      workspaceId: workspace.id,
    });
    const hasQueuedBacklog = queuedMessages.length > 0;

    const streamId = generateId();

    // Conditional claim: only one caller can move the thread from idle to
    // streaming, no matter how requests interleave.
    const claim = hasQueuedBacklog
      ? { affected: 0 }
      : await this.threadRepository.update(
          workspace.id,
          {
            id: threadId,
            activeStreamId: IsNull(),
            pendingQuestionMessageId: IsNull(),
          },
          { activeStreamId: streamId, lastStreamError: null },
        );

    if (!claim.affected) {
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

    await this.streamHeartbeatService.markClaimed(streamId);

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

      return { queued: false, streamId, messageId: savedUserMessage.id };
    } catch (error) {
      await this.releaseStreamClaim(threadId, workspace.id, streamId);
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
  }): Promise<{ streamId: string; messageId: string }> {
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

    // Conditional claim: a concurrent retry, send, or queue flush loses the
    // race instead of double-enqueueing the turn.
    const claim = await this.threadRepository.update(
      workspace.id,
      {
        id: threadId,
        activeStreamId: IsNull(),
        lastStreamError: Not(IsNull()),
      },
      { activeStreamId: streamId, lastStreamError: null },
    );

    if (!claim.affected) {
      throw new AiException(
        'There is no failed turn to retry on this thread',
        AiExceptionCode.NO_FAILED_TURN_TO_RETRY,
      );
    }

    await this.streamHeartbeatService.markClaimed(streamId);

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

      return { streamId, messageId: lastUserMessage.id };
    } catch (error) {
      await this.threadRepository
        .update(
          workspace.id,
          { id: threadId, activeStreamId: streamId },
          { activeStreamId: null, lastStreamError: thread.lastStreamError },
        )
        .catch(() => {});
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

    // Conditional claim: a send or retry racing this drain loses or wins the
    // idle→streaming transition atomically; the loser leaves the queue alone.
    const claim = await this.threadRepository.update(
      workspaceId,
      {
        id: threadId,
        activeStreamId: IsNull(),
        pendingQuestionMessageId: IsNull(),
      },
      { activeStreamId: streamId, lastStreamError: null },
    );

    if (!claim.affected) {
      return;
    }

    await this.streamHeartbeatService.markClaimed(streamId);

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
      throw error;
    }
  }

  private async releaseStreamClaim(
    threadId: string,
    workspaceId: string,
    streamId: string,
  ): Promise<void> {
    await this.threadRepository
      .update(
        workspaceId,
        { id: threadId, activeStreamId: streamId },
        { activeStreamId: null },
      )
      .catch(() => {});
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
