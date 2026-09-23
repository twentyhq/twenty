import { isNonEmptyString } from '@sniptt/guards';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { Injectable, Logger } from '@nestjs/common';

import { generateId } from 'ai';
import {
  type AskQuestionAnswer,
  type ExtendedFileUIPart,
  type ExtendedUIMessagePart,
  isExtendedFileUIPart,
} from 'twenty-shared/ai';
import { FileFolder } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
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
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadEntity>,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    @InjectMessageQueue(MessageQueue.aiStreamQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly agentChatService: AgentChatService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly fileUrlService: FileUrlService,
    private readonly streamHeartbeatService: AgentChatStreamHeartbeatService,
    private readonly metricsService: MetricsService,
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
    private readonly actorService: AgentChatActorService,
  ) {}

  async reapDeadStream({
    thread,
    workspaceId,
  }: {
    thread: Pick<AgentChatThreadEntity, 'id' | 'activeStreamId'>;
    workspaceId: string;
  }): Promise<AgentChatThreadLastStreamError | null> {
    return this.streamRecoveryService.reapDeadStream({
      thread,
      workspaceId,
    });
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
    await this.streamHeartbeatService.markClaimed(streamId);

    const claim = await this.threadRepository.update(
      workspaceId,
      { id: threadId, activeStreamId: IsNull(), ...where },
      { activeStreamId: streamId, lastStreamError: null },
    );

    if (!claim.affected) {
      await this.streamHeartbeatService.clear(streamId);

      return false;
    }

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
    await this.agentChatService.getThreadById({
      threadId,
      userWorkspaceId,
      workspaceId: workspace.id,
    });
    const thread = await this.threadRepository.findOne(workspace.id, {
      where: {
        id: threadId,
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
        await this.flushNextQueuedMessage({
          threadId,
          workspaceId: workspace.id,
          hasTitle: !!thread.title,
        });
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
        userWorkspaceId,
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
          hasTitle: !!thread.title,
          conversationSizeTokens: thread.conversationSize,
          existingTurnId: savedUserMessage.turnId ?? undefined,
          messageId: savedUserMessage.id,
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

  async startHiddenKickoffStream({
    thread,
    userWorkspaceId,
    workspace,
    text,
    modelId,
  }: {
    thread: AgentChatThreadEntity;
    userWorkspaceId: string;
    workspace: WorkspaceEntity;
    text: string;
    modelId: string;
  }): Promise<{ streamId: string; messageId: string; turnId: string } | null> {
    const threadId = thread.id;
    const streamId = generateId();

    const hasClaimedStreamForKickoff = await this.tryClaimStream({
      threadId,
      workspaceId: workspace.id,
      streamId,
      where: { pendingQuestionMessageId: IsNull() },
    });

    if (!hasClaimedStreamForKickoff) {
      return null;
    }

    try {
      const hasConversationMessages =
        await this.agentChatService.hasConversationMessages({
          threadId,
          workspaceId: workspace.id,
        });

      if (hasConversationMessages) {
        await this.releaseStreamClaim(threadId, workspace.id, streamId);
        await this.flushNextQueuedMessage({
          threadId,
          workspaceId: workspace.id,
          hasTitle: !!thread.title,
        });

        return null;
      }

      const { id: messageId, turnId } =
        await this.agentChatService.ensureHiddenKickoffMessage({
          threadId,
          workspaceId: workspace.id,
          text,
          userWorkspaceId,
        });

      const messages = await this.loadMessagesFromDB(
        threadId,
        userWorkspaceId,
        workspace.id,
      );

      const kickoffMessage = messages[messages.length - 1];

      if (!kickoffMessage || kickoffMessage.id !== messageId) {
        throw new AiException(
          'Workspace setup kickoff message could not be loaded',
          AiExceptionCode.MESSAGE_NOT_FOUND,
        );
      }

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
          lastUserMessageText: text,
          hasTitle: !!thread.title,
          conversationSizeTokens: thread.conversationSize,
          existingTurnId: turnId,
          messageId,
        },
      );

      return { streamId, messageId, turnId };
    } catch (error) {
      await this.releaseStreamClaim(threadId, workspace.id, streamId);
      const streamError = mapErrorToStreamError(error);

      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AiChatTurnFailed,
        amount: 1,
        attributes: {
          model: modelId,
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
    await this.agentChatService.getThreadById({
      threadId,
      userWorkspaceId,
      workspaceId: workspace.id,
    });
    const thread = await this.threadRepository.findOne(workspace.id, {
      where: { id: threadId },
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

    const latestMessage = await this.agentChatService.findLatestSentUserMessage(
      { threadId, workspaceId: workspace.id },
    );
    if (!isDefined(latestMessage)) {
      throw new AiException(
        'There is no failed turn to retry',
        AiExceptionCode.NO_FAILED_TURN_TO_RETRY,
      );
    }
    await this.actorService.authorizeRetry({
      workspaceId: workspace.id,
      threadId,
      messageId: latestMessage.id,
      userWorkspaceId,
    });

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

      if (
        !isDefined(lastUserMessage) ||
        !isDefined(lastUserMessage.turnId) ||
        lastUserMessage.id !== latestMessage.id
      ) {
        throw new AiException(
          'There is no failed turn to retry on this thread',
          AiExceptionCode.NO_FAILED_TURN_TO_RETRY,
        );
      }

      await this.actorService.authorizeRetry({
        workspaceId: workspace.id,
        threadId,
        messageId: lastUserMessage.id,
        userWorkspaceId,
      });

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
          hasTitle: !!thread.title,
          conversationSizeTokens: thread.conversationSize,
          existingTurnId: lastUserMessage.turnId,
          messageId: lastUserMessage.id,
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

  async answerPendingQuestionAndResumeStream({
    threadId,
    messageId,
    answers,
    userWorkspaceId,
    workspace,
    modelId,
    fileAttachments,
  }: {
    threadId: string;
    messageId: string;
    answers: AskQuestionAnswer[];
    userWorkspaceId: string;
    workspace: WorkspaceEntity;
    modelId?: string;
    fileAttachments?: AiChatFileAttachment[];
  }): Promise<{ streamId: string; turnId: string | null }> {
    await this.agentChatService.getThreadById({
      threadId,
      userWorkspaceId,
      workspaceId: workspace.id,
    });
    if (
      !answers.some(
        (answer) =>
          isNonEmptyString(answer.freeText?.trim()) ||
          isNonEmptyArray(answer.selectedOptionIndices),
      ) &&
      !isNonEmptyArray(fileAttachments)
    ) {
      throw new AiException(
        'Provide an answer or attachment',
        AiExceptionCode.INVALID_QUESTION_ANSWER,
      );
    }
    await this.actorService.authorizeQuestionAnswer({
      workspaceId: workspace.id,
      threadId,
      messageId,
    });
    const thread = await this.threadRepository.findOne(workspace.id, {
      where: { id: threadId },
      select: ['id', 'activeStreamId'],
    });

    if (isDefined(thread)) {
      await this.reapDeadStream({ thread, workspaceId: workspace.id });
    }

    const streamId = generateId();

    await this.streamHeartbeatService.markClaimed(streamId);

    let resolved: {
      answerText: string;
      turnId: string | null;
      rollback: { partId: string; previousOutput: Record<string, unknown> };
    };

    try {
      resolved = await this.agentChatService.resolvePendingQuestion({
        threadId,
        messageId,
        answers,
        streamId,
        workspaceId: workspace.id,
      });
    } catch (error) {
      await this.streamHeartbeatService.clear(streamId);
      throw error;
    }

    let answerMessageId: string | null = null;

    try {
      const fileParts = await this.buildFilePartsFromAttachments(
        fileAttachments,
        workspace.id,
      );

      const answerMessage = await this.agentChatService.addMessage({
        threadId,
        userWorkspaceId,
        uiMessage: {
          role: AgentMessageRole.USER,
          parts: [
            {
              type: 'text',
              text: resolved.answerText,
            },
            ...fileParts,
          ],
        },
        workspaceId: workspace.id,
      });
      answerMessageId = answerMessage.id;
      resolved.turnId = answerMessage.turnId;

      await this.enqueueResumeStream({
        threadId,
        userWorkspaceId,
        workspace,
        turnId: resolved.turnId,
        streamId,
        modelId,
        messageId: answerMessage.id,
      });
    } catch (error) {
      if (isDefined(answerMessageId)) {
        await this.agentChatService
          .deleteMessage({
            messageId: answerMessageId,
            workspaceId: workspace.id,
          })
          .catch(() => {});
      }
      await this.agentChatService.restorePendingQuestion({
        threadId,
        messageId,
        streamId,
        workspaceId: workspace.id,
        rollback: resolved.rollback,
      });
      await this.streamHeartbeatService.clear(streamId);
      throw error;
    }

    await this.eventPublisherService
      .publish({
        threadId,
        workspaceId: workspace.id,
        event: { type: 'question-answered' },
      })
      .catch(() => {});

    return { streamId, turnId: resolved.turnId };
  }

  private async enqueueResumeStream({
    threadId,
    userWorkspaceId,
    workspace,
    turnId,
    streamId,
    modelId,
    messageId,
  }: {
    messageId: string;
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
        hasTitle: !!thread.title,
        conversationSizeTokens: thread.conversationSize,
        existingTurnId: turnId ?? undefined,
        messageId,
      },
    );
  }

  async flushNextQueuedMessage({
    threadId,
    workspaceId,
    hasTitle,
  }: {
    threadId: string;
    workspaceId: string;
    hasTitle: boolean;
  }): Promise<void> {
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

    let nextQueued: (typeof queuedMessages)[number] | undefined;
    let userWorkspaceId: string | undefined;
    for (const candidate of queuedMessages) {
      try {
        const { sender } = await this.actorService.resolveMessage({
          workspaceId,
          threadId,
          messageId: candidate.id,
        });
        await this.actorService.authorize({ workspaceId, threadId, sender });
        nextQueued = candidate;
        userWorkspaceId = sender.userWorkspaceId;
        break;
      } catch (error) {
        // A rolling upgrade can temporarily leave a worker with an older access
        // policy. Preserve the request until a worker can authorize it.
        if (
          error instanceof AiException &&
          error.code === AiExceptionCode.THREAD_NOT_FOUND
        ) {
          continue;
        }

        if (
          !(error instanceof AuthException) &&
          !(error instanceof PermissionsException) &&
          !(
            error instanceof AiException &&
            error.code === AiExceptionCode.MESSAGE_NOT_FOUND
          )
        ) {
          throw error;
        }
        await this.agentChatService.deleteQueuedMessage({
          messageId: candidate.id,
          workspaceId,
        });
        await this.eventPublisherService.publish({
          threadId,
          workspaceId,
          event: { type: 'queue-updated' },
        });
      }
    }
    if (!isDefined(nextQueued) || !isDefined(userWorkspaceId)) {
      return;
    }

    const textPart = nextQueued.parts?.find((part) => part.type === 'text');
    const messageText = textPart?.textContent ?? '';
    const hasFileAttachment = (nextQueued.parts ?? []).some(
      (part) => part.type === 'file',
    );

    if (messageText === '' && !hasFileAttachment) {
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
          hasTitle,
          conversationSizeTokens: thread.conversationSize,
          existingTurnId: turnId,
          messageId: nextQueued.id,
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
    await this.streamHeartbeatService.clear(streamId);
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
      includeHidden: true,
    });

    const thread = allMessages.some((message) => message.isHidden)
      ? await this.threadRepository.findOneOrFail(workspaceId, {
          where: { id: threadId },
        })
      : undefined;
    // A hidden row without parts is an interrupted seed attempt: it carries no context and
    // would otherwise reach the model as an empty user message.
    const filteredMessages = allMessages.filter(
      (message) =>
        message.status !== AgentMessageStatus.QUEUED &&
        (!message.isHidden ||
          (isNonEmptyArray(message.parts) &&
            (message.senderUserWorkspaceId ?? thread?.userWorkspaceId) ===
              userWorkspaceId)),
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
        // The hidden context seed gets no createdAt so injectMessageTimestamps skips it: its
        // insert time is meaningless and later than the first real message it sorts before.
        ...(message.isHidden
          ? {}
          : {
              metadata: {
                createdAt: message.createdAt.toISOString(),
                senderUserWorkspaceId: message.senderUserWorkspaceId,
              },
            }),
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
