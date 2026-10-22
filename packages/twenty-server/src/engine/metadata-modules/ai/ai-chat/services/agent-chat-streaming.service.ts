import { isNonEmptyString } from '@sniptt/guards';
import { AgentChatQueueService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-queue.service';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { Injectable, Logger } from '@nestjs/common';

import { generateId, type TextUIPart } from 'ai';
import {
  type ExtendedFileUIPart,
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';
import { FileFolder } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, Like } from 'typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { type AgentConversationWait } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-conversation-wait.type';
import { mapDBPartsToUIMessageParts } from 'src/engine/metadata-modules/ai/ai-history/utils/map-db-parts-to-ui-message-parts.util';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsing-context.type';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { STREAM_AGENT_CHAT_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat-job-name.constant';
import { type StreamAgentChatJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat-job.types';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentConversationReaderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-reader.service';
import { AgentChatThreadLifecycleService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-lifecycle.service';
import { AiChatFileAttachment } from 'src/engine/metadata-modules/ai/ai-chat/types/ai-chat-file-attachment.type';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { mapErrorToStreamError } from 'src/engine/metadata-modules/ai/ai-history/utils/map-error-to-stream-error.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';

type MemberMessageOptions = {
  thread: AgentChatThreadWorkspaceEntity;
  userWorkspaceId: string;
  workspaceMemberId: string;
  workspace: WorkspaceEntity;
  text: string;
  messageId?: string;
  fileAttachments?: AiChatFileAttachment[];
};

type StreamAgentChatOptions = MemberMessageOptions & {
  browsingContext: BrowsingContextType | null;
  modelId?: string;
};

@Injectable()
export class AgentChatStreamingService {
  private readonly logger = new Logger(AgentChatStreamingService.name);

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    @InjectMessageQueue(MessageQueue.aiStreamQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly agentChatService: AgentChatService,
    private readonly agentChatQueueService: AgentChatQueueService,
    private readonly threadService: AgentChatThreadService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly conversationReaderService: AgentConversationReaderService,
    private readonly metricsService: MetricsService,
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
    private readonly actorService: AgentChatActorService,
    private readonly turnRecorderService: AgentTurnRecorderService,
    private readonly agentRunSuspensionService: AgentRunSuspensionService,
    private readonly threadLifecycleService: AgentChatThreadLifecycleService,
  ) {}

  // a message sent while a reply or a run streams in the conversation waits in its queue
  async streamAgentChat(
    options: StreamAgentChatOptions,
  ): Promise<
    | { queued: false; streamId: string; messageId: string; turnId: string }
    | { queued: true; messageId: string }
  > {
    const {
      thread,
      userWorkspaceId,
      workspaceMemberId,
      workspace,
      text,
      browsingContext,
      modelId,
      messageId,
      fileAttachments,
    } = options;
    const threadId = thread.id;
    const workspaceId = workspace.id;

    const [conversationWait, hasQueuedBacklog] = await Promise.all([
      this.agentRunSuspensionService.findConversationWait({
        workspaceId,
        thread,
      }),
      this.agentChatQueueService.hasQueuedMessages({ threadId, workspaceId }),
    ]);
    const { suspendedRun } = conversationWait;

    await this.settlePendingToolCallsBeforeSending({
      threadId,
      workspaceId,
      conversationWait,
    });

    const started =
      hasQueuedBacklog || isDefined(suspendedRun)
        ? null
        : await this.startClaimedTurn(
            { threadId, workspaceId, modelId },
            async (streamId) => {
              const savedUserMessage = await this.addMemberMessage({
                ...options,
                eventType: 'message-persisted',
              });

              await this.enqueueStreamJob({
                threadId,
                workspaceId,
                workspaceMemberId,
                streamId,
                userWorkspaceId,
                browsingContext,
                modelId,
                turnId: savedUserMessage.turnId,
                messageId: savedUserMessage.id,
              });

              return {
                queued: false as const,
                streamId,
                messageId: savedUserMessage.id,
                turnId: savedUserMessage.turnId,
              };
            },
          );

    if (isDefined(started)) {
      return started;
    }

    const queuedMessage = await this.agentChatQueueService.queueMessage({
      threadId,
      text,
      id: messageId,
      fileAttachments,
      workspaceId,
      userWorkspaceId,
      workspaceMemberId,
    });

    if (isDefined(suspendedRun)) {
      await this.agentRunSuspensionService.scheduleContinuation({
        workspaceId,
        threadId,
        wakeUpId: suspendedRun.id,
        outcome: { type: 'MESSAGE_RECEIVED' },
      });
    } else {
      // the stream may have let go just before this message was queued, finding nothing to send
      await this.flushNextQueuedMessage({ threadId, workspaceId });
    }

    return { queued: true, messageId: queuedMessage.id };
  }

  async saveMessageWithoutReply(
    options: MemberMessageOptions,
  ): Promise<{ messageId: string }> {
    const savedMessage = await this.addMemberMessage({
      ...options,
      turnStatus: AgentTurnStatus.COMPLETED,
      eventType: 'message-added',
    });

    return { messageId: savedMessage.id };
  }

  // the agent speaks first, from a context in place of a user message
  async startOpeningTurn({
    thread,
    userWorkspaceId,
    workspaceMemberId,
    workspace,
    context,
    modelId,
  }: {
    thread: AgentChatThreadWorkspaceEntity;
    userWorkspaceId: string;
    workspaceMemberId: string;
    workspace: WorkspaceEntity;
    context: string;
    modelId: string;
  }): Promise<{ streamId: string; turnId: string } | null> {
    const threadId = thread.id;
    const workspaceId = workspace.id;

    return this.startClaimedTurn(
      { threadId, workspaceId, modelId },
      async (streamId) => {
        if (
          await this.agentChatService.hasMessages({ threadId, workspaceId })
        ) {
          return null;
        }

        const turnId = await this.agentChatService.replaceOpeningTurn({
          threadId,
          workspaceId,
          context,
        });

        await this.enqueueStreamJob({
          threadId,
          workspaceId,
          workspaceMemberId,
          streamId,
          userWorkspaceId,
          modelId,
          turnId,
        });

        return { streamId, turnId };
      },
    );
  }

  async retryLastFailedTurn({
    threadId,
    userWorkspaceId,
    workspaceMemberId,
    workspace,
    modelId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceMemberId: string;
    workspace: WorkspaceEntity;
    modelId?: string;
  }): Promise<{ streamId: string; messageId: string | null; turnId: string }> {
    const workspaceId = workspace.id;
    const thread = await this.threadService.getWritableThread({
      threadId,
      workspaceMemberId,
      workspaceId,
    });
    if (isNonEmptyString(thread.activeStreamId)) {
      throw this.noFailedTurnToRetry();
    }

    const latestTurn = await this.turnRecorderService.findLatestTurn({
      threadId,
      workspaceId,
    });

    if (latestTurn?.status !== AgentTurnStatus.FAILED) {
      throw this.noFailedTurnToRetry();
    }

    const turnId = latestTurn.id;

    const { message } = await this.actorService.authorizeRetry({
      workspaceId,
      threadId,
      turnId,
      userWorkspaceId,
    });

    const started = await this.startClaimedTurn(
      { threadId, workspaceId, modelId },
      async (streamId) => {
        // the latest turn may have changed while claiming, and its output is not ours to delete
        const claimedTurn = await this.turnRecorderService.findLatestTurn({
          threadId,
          workspaceId,
        });

        if (
          claimedTurn?.id !== turnId ||
          claimedTurn.status !== AgentTurnStatus.FAILED
        ) {
          throw this.noFailedTurnToRetry();
        }

        const isRunning = await this.turnRecorderService.markRunning({
          workspaceId,
          turnId,
          streamClaim: { threadId, streamId },
        });

        if (!isRunning) {
          throw this.noFailedTurnToRetry();
        }

        await this.agentChatService.deleteAssistantMessagesForTurn({
          turnId,
          workspaceId,
        });

        await this.enqueueStreamJob({
          threadId,
          workspaceId,
          workspaceMemberId,
          streamId,
          userWorkspaceId,
          modelId,
          turnId,
          messageId: message?.id,
        });

        return { streamId, messageId: message?.id ?? null, turnId };
      },
    );

    if (!isDefined(started)) {
      throw this.noFailedTurnToRetry();
    }

    return started;
  }

  async flushNextQueuedMessage({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<void> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
      select: ['id', 'deletedAt', 'pendingQuestionMessageId', 'activeStreamId'],
    });

    // the stream flushes the queue when it lets go, so a send behind it reads nothing more
    if (
      !thread ||
      thread.deletedAt ||
      isNonEmptyString(thread.activeStreamId)
    ) {
      return;
    }

    const next = await this.findQueuedMessageToSend({ thread, workspaceId });

    if (!isDefined(next)) {
      await this.streamRecoveryService.wakeNext({
        threadId,
        workspaceId,
        shouldFlush: false,
      });

      return;
    }

    const { message, userWorkspaceId, workspaceMemberId } = next;
    const textPart = message.parts?.find((part) => part.type === 'text');
    const hasFileAttachment = (message.parts ?? []).some(
      (part) => part.type === 'file',
    );

    if (!isNonEmptyString(textPart?.textContent) && !hasFileAttachment) {
      await this.agentChatQueueService.deleteQueuedMessage({
        messageId: message.id,
        workspaceId,
      });

      return;
    }

    await this.startClaimedTurn({ threadId, workspaceId }, async (streamId) => {
      const turnId = await this.agentChatQueueService.promoteQueuedMessage({
        messageId: message.id,
        threadId,
        workspaceId,
      });

      if (turnId === null) {
        return null;
      }

      await this.eventPublisherService.publish({
        threadId,
        workspaceId,
        event: { type: 'queue-updated' },
      });

      await this.eventPublisherService.publish({
        threadId,
        workspaceId,
        event: { type: 'message-persisted', messageId: message.id },
      });

      await this.enqueueStreamJob({
        threadId,
        workspaceId,
        workspaceMemberId,
        streamId,
        userWorkspaceId,
        turnId,
        messageId: message.id,
      });

      return turnId;
    });
  }

  // the thread's claim must be held; the title comes from the turn's message unless the caller passes its own
  async enqueueStreamJob({
    threadId,
    workspaceId,
    workspaceMemberId,
    turnId,
    messageId,
    browsingContext = null,
    lastUserMessageText,
    ...data
  }: Pick<
    StreamAgentChatJobData,
    | 'threadId'
    | 'workspaceId'
    | 'streamId'
    | 'userWorkspaceId'
    | 'modelId'
    | 'messageId'
  > & {
    workspaceMemberId: string;
    turnId: string;
    browsingContext?: BrowsingContextType | null;
    lastUserMessageText?: string;
  }): Promise<void> {
    const [thread, messages] = await Promise.all([
      this.threadRepository.findOneOrFail(workspaceId, {
        where: { id: threadId },
        select: ['id', 'title', 'conversationSize'],
      }),
      this.loadMessagesFromDB(threadId, workspaceId, workspaceMemberId),
    ]);

    await this.messageQueueService.add<StreamAgentChatJobData>(
      STREAM_AGENT_CHAT_JOB_NAME,
      {
        ...data,
        threadId,
        workspaceId,
        messageId,
        messages,
        browsingContext,
        existingTurnId: turnId,
        lastUserMessageText:
          lastUserMessageText ??
          messages
            .find(({ id }) => id === messageId)
            ?.parts.find((part): part is TextUIPart => part.type === 'text')
            ?.text ??
          '',
        hasTitle: isNonEmptyString(thread.title),
        conversationSizeTokens: thread.conversationSize,
      },
    );
  }

  private async addMemberMessage({
    thread,
    userWorkspaceId,
    workspaceMemberId,
    workspace,
    text,
    messageId,
    fileAttachments,
    turnStatus,
    eventType,
  }: MemberMessageOptions & {
    turnStatus?: AgentTurnStatus;
    eventType: 'message-added' | 'message-persisted';
  }) {
    const threadId = thread.id;
    const workspaceId = workspace.id;

    const fileParts = await this.buildFilePartsFromAttachments(
      fileAttachments,
      workspaceId,
    );

    const savedMessage = await this.agentChatService.addMessage({
      threadId,
      userWorkspaceId,
      id: messageId,
      uiMessage: {
        role: AgentMessageRole.USER,
        parts: [{ type: 'text' as const, text }, ...fileParts],
      },
      turnStatus,
      workspaceId,
    });

    await this.eventPublisherService.publish({
      workspaceId,
      threadId,
      event: { type: eventType, messageId: savedMessage.id },
    });

    await this.threadService.notifyThreadActivityUpdated({
      threadId,
      workspaceMemberId,
      workspaceId,
      text,
    });

    return savedMessage;
  }

  private async findQueuedMessageToSend({
    thread,
    workspaceId,
  }: {
    thread: Pick<
      AgentChatThreadWorkspaceEntity,
      'id' | 'pendingQuestionMessageId'
    >;
    workspaceId: string;
  }) {
    const threadId = thread.id;
    const [queuedMessages, { suspendedRun, pendingQuestionMessageId }] =
      await Promise.all([
        this.agentChatQueueService.getQueuedMessages({ threadId, workspaceId }),
        this.agentRunSuspensionService.findConversationWait({
          workspaceId,
          thread,
        }),
      ]);

    // a run that went on to ask something reads what was sent meanwhile, as a message sent now would skip its question
    if (isNonEmptyArray(queuedMessages) && isDefined(suspendedRun)) {
      await this.agentRunSuspensionService.scheduleContinuation({
        workspaceId,
        threadId,
        wakeUpId: suspendedRun.id,
        outcome: { type: 'MESSAGE_RECEIVED' },
      });

      return null;
    }

    // queued messages wait behind a pending tool call: they follow the answer rather than replace it
    if (isDefined(pendingQuestionMessageId)) {
      return null;
    }

    for (const message of queuedMessages) {
      try {
        const { sender } = await this.actorService.resolveMessage({
          workspaceId,
          threadId,
          messageId: message.id,
        });
        const authorization = await this.actorService.authorize({
          workspaceId,
          threadId,
          sender,
        });

        return {
          message,
          userWorkspaceId: sender.userWorkspaceId,
          workspaceMemberId: authorization.authContext.workspaceMemberId,
        };
      } catch (error) {
        // during a rolling upgrade a worker may run an older access policy, so keep the request for another worker
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
        await this.agentChatQueueService.deleteQueuedMessage({
          messageId: message.id,
          workspaceId,
        });
        await this.eventPublisherService.publish({
          threadId,
          workspaceId,
          event: { type: 'queue-updated' },
        });
      }
    }

    return null;
  }

  // a message sent while an agent waits on a person closes its pending calls as skipped, so the model sees why.
  // A call a caller such as a workflow step posted waits on its own answer, so it refuses the message
  private async settlePendingToolCallsBeforeSending({
    threadId,
    workspaceId,
    conversationWait: { hasPostedCall, pendingQuestionMessageId: messageId },
  }: {
    threadId: string;
    workspaceId: string;
    conversationWait: Pick<
      AgentConversationWait,
      'hasPostedCall' | 'pendingQuestionMessageId'
    >;
  }): Promise<void> {
    if (hasPostedCall) {
      throw new AiException(
        'The conversation is waiting on an answer; answer it before sending a message',
        AiExceptionCode.THREAD_AWAITING_ANSWER,
      );
    }

    if (!isDefined(messageId)) {
      return;
    }

    // the member moved on from the question, which ends the turn that asked it
    await this.threadLifecycleService.closePendingQuestion({
      workspaceId,
      threadId,
      messageId,
      activeStreamId: null,
      turnStatus: AgentTurnStatus.COMPLETED,
    });
  }

  // starts a turn under a new claim; null when the thread is busy or there turned out to be nothing to start
  private async startClaimedTurn<TResult>(
    {
      threadId,
      workspaceId,
      modelId,
    }: { threadId: string; workspaceId: string; modelId?: string },
    start: (streamId: string) => Promise<TResult | null>,
  ): Promise<TResult | null> {
    const claim = { threadId, workspaceId, streamId: generateId() };

    if (!(await this.streamRecoveryService.tryClaimStream(claim))) {
      return null;
    }

    try {
      const started = await start(claim.streamId);

      if (!isDefined(started)) {
        await this.streamRecoveryService.release({
          ...claim,
          shouldFlush: true,
        });
      }

      return started;
    } catch (error) {
      // a turn the claim already started fails with the enqueue error
      await this.streamRecoveryService.release({
        ...claim,
        turnError: mapErrorToStreamError(error),
        shouldFlush: true,
      });

      const model = modelId ?? 'unknown';

      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AiChatTurnFailed,
        amount: 1,
        attributes: {
          model,
          failure_phase: 'enqueue',
          error_code: mapErrorToStreamError(error).code,
        },
      });

      this.logger.error(
        `[AI_CHAT_TURN_FAILED] failurePhase=enqueue, model=${model}, threadId=${threadId}, workspaceId=${workspaceId}: ${formatErrorWithCause(error)}`,
      );

      throw error;
    }
  }

  private noFailedTurnToRetry(): AiException {
    return new AiException(
      'There is no failed turn to retry on this thread',
      AiExceptionCode.NO_FAILED_TURN_TO_RETRY,
    );
  }

  private async loadMessagesFromDB(
    threadId: string,
    workspaceId: string,
    workspaceMemberId: string,
  ): Promise<ExtendedUIMessage[]> {
    const [allMessages, contexts] = await Promise.all([
      this.agentChatService.getMessagesForThread({
        threadId,
        workspaceMemberId,
        workspaceId,
      }),
      this.agentChatService.getThreadContexts({
        threadId,
        workspaceMemberId,
        workspaceId,
      }),
    ]);

    const sentMessages = allMessages.filter(
      (message) => message.status !== AgentMessageStatus.QUEUED,
    );

    const uiMessages = await Promise.all(
      sentMessages.map(async (message) => ({
        id: message.id,
        role: message.role as 'user' | 'assistant' | 'system',
        parts: await this.conversationReaderService.signFileParts({
          workspaceId,
          parts: mapDBPartsToUIMessageParts(message.parts ?? []),
        }),
        metadata: {
          createdAt: new Date(message.createdAt).toISOString(),
          senderWorkspaceMemberId: message.senderWorkspaceMemberId,
        },
      })),
    );

    // contexts open their thread, and Google and Bedrock only take system messages ahead of the conversation
    return [
      ...contexts.map((context, index): ExtendedUIMessage => ({
        id: `context-${index}`,
        role: 'system',
        parts: [{ type: 'text', text: context }],
      })),
      ...uiMessages,
    ];
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
