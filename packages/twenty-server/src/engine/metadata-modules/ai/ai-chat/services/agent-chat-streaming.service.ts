import { isNonEmptyString } from '@sniptt/guards';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import {
  type AgentChatStreamClaim,
  AgentChatStreamRecoveryService,
} from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { Injectable, Logger } from '@nestjs/common';

import { generateId, type TextUIPart } from 'ai';
import {
  type ExtendedFileUIPart,
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
  isExtendedFileUIPart,
} from 'twenty-shared/ai';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type FindOptionsWhere, In, IsNull, Like } from 'typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { isToolOutputAwaitedByCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/is-tool-output-awaited-by-caller.util';
import { mapDBPartsToUIMessageParts } from 'src/engine/metadata-modules/ai/ai-history/utils/map-db-parts-to-ui-message-parts.util';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsing-context.type';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { STREAM_AGENT_CHAT_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat-job-name.constant';
import { type StreamAgentChatJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat-job.types';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamHeartbeatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-heartbeat.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
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

type StreamAgentChatOptions = {
  thread: AgentChatThreadWorkspaceEntity;
  userWorkspaceId: string;
  workspaceMemberId: string;
  workspace: WorkspaceEntity;
  text: string;
  browsingContext: BrowsingContextType | null;
  modelId?: string;
  messageId?: string;
  fileAttachments?: AiChatFileAttachment[];
};

type StreamJobThread = Pick<
  AgentChatThreadWorkspaceEntity,
  'id' | 'title' | 'conversationSize'
>;

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
    private readonly threadService: AgentChatThreadService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly fileUrlService: FileUrlService,
    private readonly streamHeartbeatService: AgentChatStreamHeartbeatService,
    private readonly metricsService: MetricsService,
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
    private readonly actorService: AgentChatActorService,
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartWorkspaceEntity>,
    private readonly turnRecorderService: AgentTurnRecorderService,
    private readonly agentRunSuspensionService: AgentRunSuspensionService,
    private readonly agentRunConversationService: AgentRunConversationService,
  ) {}

  async tryClaimStream({
    threadId,
    workspaceId,
    streamId,
    where = {},
  }: AgentChatStreamClaim & {
    where?: FindOptionsWhere<AgentChatThreadWorkspaceEntity>;
  }): Promise<boolean> {
    await this.streamHeartbeatService.markClaimed(streamId);

    const claim = await this.threadRepository.update(
      workspaceId,
      { id: threadId, activeStreamId: IsNull(), ...where },
      { activeStreamId: streamId },
    );

    if (!claim.affected) {
      await this.streamHeartbeatService.clear(streamId);

      return false;
    }

    return true;
  }

  // a message that lands while a run goes on in the conversation would be read by that run once it
  // goes on after a wait, so it is let in only between runs
  streamAgentChat(options: StreamAgentChatOptions) {
    return this.agentRunConversationService.withThreadLockForMessage({
      workspaceId: options.workspace.id,
      threadId: options.thread.id,
      work: () => this.startOrQueueMessage(options),
    });
  }

  private async startOrQueueMessage({
    thread,
    userWorkspaceId,
    workspaceMemberId,
    workspace,
    text,
    browsingContext,
    modelId,
    messageId,
    fileAttachments,
  }: StreamAgentChatOptions): Promise<
    | { queued: false; streamId: string; messageId: string; turnId: string }
    | { queued: true; messageId: string }
  > {
    const threadId = thread.id;
    const workspaceId = workspace.id;

    const [, hasQueuedBacklog] = await Promise.all([
      this.settlePendingToolCallsBeforeSending({ thread, workspaceId }),
      this.agentChatService.hasQueuedMessages({ threadId, workspaceId }),
    ]);

    const streamId = generateId();

    const claimed =
      !hasQueuedBacklog &&
      (await this.tryClaimStream({ threadId, workspaceId, streamId }));

    if (!claimed) {
      const queuedMessage = await this.agentChatService.queueMessage({
        threadId,
        text,
        id: messageId,
        fileAttachments,
        workspaceId,
        userWorkspaceId,
        workspaceMemberId,
      });

      if (hasQueuedBacklog) {
        await this.flushNextQueuedMessage({ threadId, workspaceId });
      }

      return { queued: true, messageId: queuedMessage.id };
    }

    return this.releaseClaimOnEnqueueFailure(
      { threadId, workspaceId, streamId, modelId },
      async () => {
        const fileParts = await this.buildFilePartsFromAttachments(
          fileAttachments,
          workspaceId,
        );

        const savedUserMessage = await this.agentChatService.addMessage({
          threadId,
          userWorkspaceId,
          id: messageId,
          uiMessage: {
            role: AgentMessageRole.USER,
            parts: [{ type: 'text' as const, text }, ...fileParts],
          },
          workspaceId,
        });

        await this.eventPublisherService.publish({
          workspaceId,
          threadId,
          event: { type: 'message-persisted', messageId: savedUserMessage.id },
        });

        await this.threadService.notifyThreadActivityUpdated({
          threadId,
          workspaceMemberId,
          workspaceId,
          text,
        });

        await this.enqueueStreamJob({
          thread,
          streamId,
          userWorkspaceId,
          workspaceId,
          messages: await this.loadMessagesFromDB(
            threadId,
            workspaceId,
            workspaceMemberId,
          ),
          browsingContext,
          modelId,
          lastUserMessageText: text,
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
    const streamId = generateId();

    const claimed = await this.tryClaimStream({
      threadId,
      workspaceId,
      streamId,
    });

    if (!claimed) {
      return null;
    }

    return this.releaseClaimOnEnqueueFailure(
      { threadId, workspaceId, streamId, modelId },
      async () => {
        if (
          await this.agentChatService.hasMessages({ threadId, workspaceId })
        ) {
          await this.streamRecoveryService.releaseStreamClaim({
            threadId,
            workspaceId,
            streamId,
          });
          await this.flushNextQueuedMessage({ threadId, workspaceId });

          return null;
        }

        const turnId = await this.agentChatService.replaceOpeningTurn({
          threadId,
          workspaceId,
          context,
        });

        await this.enqueueStreamJob({
          thread,
          streamId,
          userWorkspaceId,
          workspaceId,
          messages: await this.loadMessagesFromDB(
            threadId,
            workspaceId,
            workspaceMemberId,
          ),
          browsingContext: null,
          modelId,
          lastUserMessageText: '',
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

    const streamId = generateId();

    const claimed = await this.tryClaimStream({
      threadId,
      workspaceId,
      streamId,
    });

    if (!claimed) {
      throw this.noFailedTurnToRetry();
    }

    return this.releaseClaimOnEnqueueFailure(
      { threadId, workspaceId, streamId, modelId },
      async () => {
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

        const messages = await this.loadMessagesFromDB(
          threadId,
          workspaceId,
          workspaceMemberId,
        );

        const textPart = messages
          .find(({ id }) => id === message?.id)
          ?.parts.find((part): part is TextUIPart => part.type === 'text');

        await this.enqueueStreamJob({
          thread,
          streamId,
          userWorkspaceId,
          workspaceId,
          messages,
          browsingContext: null,
          modelId,
          lastUserMessageText: textPart?.text ?? '',
          turnId,
          messageId: message?.id,
        });

        return { streamId, messageId: message?.id ?? null, turnId };
      },
    );
  }

  async enqueueResumeStream({
    threadId,
    userWorkspaceId,
    workspaceMemberId,
    workspace,
    turnId,
    streamId,
    modelId,
    messageId,
  }: {
    messageId: string;
    threadId: string;
    userWorkspaceId: string;
    workspaceMemberId: string;
    workspace: WorkspaceEntity;
    turnId: string;
    streamId: string;
    modelId?: string;
  }): Promise<void> {
    const thread = await this.threadRepository.findOneOrFail(workspace.id, {
      where: { id: threadId },
    });

    await this.enqueueStreamJob({
      thread,
      streamId,
      userWorkspaceId,
      workspaceId: workspace.id,
      messages: await this.loadMessagesFromDB(
        threadId,
        workspace.id,
        workspaceMemberId,
      ),
      browsingContext: null,
      modelId,
      lastUserMessageText: '',
      turnId,
      messageId,
    });
  }

  async flushNextQueuedMessage({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<void> {
    const threadStatus = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
      select: ['id', 'deletedAt', 'pendingQuestionMessageId'],
    });

    // queued messages wait behind a pending tool call: they follow the answer rather than replace it
    if (
      !threadStatus ||
      threadStatus.deletedAt ||
      isDefined(threadStatus.pendingQuestionMessageId)
    ) {
      return;
    }

    const queuedMessages = await this.agentChatService.getQueuedMessages({
      threadId,
      workspaceId,
    });

    let nextQueued: (typeof queuedMessages)[number] | undefined;
    let userWorkspaceId: string | undefined;
    let workspaceMemberId: string | undefined;
    for (const candidate of queuedMessages) {
      try {
        const { sender } = await this.actorService.resolveMessage({
          workspaceId,
          threadId,
          messageId: candidate.id,
        });
        const authorization = await this.actorService.authorize({
          workspaceId,
          threadId,
          sender,
        });
        workspaceMemberId = authorization.authContext.workspaceMemberId;
        nextQueued = candidate;
        userWorkspaceId = sender.userWorkspaceId;
        break;
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
    if (
      !isDefined(nextQueued) ||
      !isDefined(userWorkspaceId) ||
      !isDefined(workspaceMemberId)
    ) {
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
    });

    if (!claimed) {
      return;
    }

    await this.releaseClaimOnEnqueueFailure(
      { threadId, workspaceId, streamId },
      async () => {
        const turnId = await this.agentChatService.promoteQueuedMessage({
          messageId: nextQueued.id,
          threadId,
          workspaceId,
        });

        if (turnId === null) {
          await this.streamRecoveryService.releaseStreamClaim({
            threadId,
            workspaceId,
            streamId,
          });

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

        const [messages, thread] = await Promise.all([
          this.loadMessagesFromDB(threadId, workspaceId, workspaceMemberId),
          this.threadRepository.findOneOrFail(workspaceId, {
            where: { id: threadId },
          }),
        ]);

        await this.enqueueStreamJob({
          thread,
          streamId,
          userWorkspaceId,
          workspaceId,
          messages,
          browsingContext: null,
          lastUserMessageText: messageText,
          turnId,
          messageId: nextQueued.id,
        });
      },
    );
  }

  // a message sent while the agent waits on a person closes its pending calls as skipped, so the model sees why
  // an answer holding the stream keeps them, and calls a caller waits on gate that caller, so a chat message never closes them
  private async settlePendingToolCallsBeforeSending({
    thread,
    workspaceId,
  }: {
    thread: Pick<
      AgentChatThreadWorkspaceEntity,
      'id' | 'pendingQuestionMessageId'
    >;
    workspaceId: string;
  }): Promise<void> {
    const messageId = thread.pendingQuestionMessageId;

    if (
      isDefined(messageId) &&
      (await this.isAwaitingCaller({ messageId, workspaceId }))
    ) {
      throw new AiException(
        'This conversation is waiting on an answer to the run that asked',
        AiExceptionCode.THREAD_AWAITING_ANSWER,
      );
    }

    // a run waiting on an event or a duration asks nothing, yet reads the conversation when it goes on
    await this.agentRunSuspensionService.assertConversationNotSuspended({
      workspaceId,
      threadId: thread.id,
    });

    if (!isDefined(messageId)) {
      return;
    }

    await this.agentChatService.closePendingToolCalls({
      threadId: thread.id,
      messageId,
      workspaceId,
      where: { activeStreamId: IsNull() },
    });
  }

  // a call a caller such as a workflow step waits on gates that caller until it is answered
  private async isAwaitingCaller({
    messageId,
    workspaceId,
  }: {
    messageId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const parts = await this.messagePartRepository.find(workspaceId, {
      where: { messageId },
      select: ['id', 'toolOutput'],
    });

    return parts.some((part) => isToolOutputAwaitedByCaller(part.toolOutput));
  }

  private async enqueueStreamJob({
    thread,
    turnId,
    ...data
  }: Omit<
    StreamAgentChatJobData,
    'threadId' | 'hasTitle' | 'conversationSizeTokens' | 'existingTurnId'
  > & {
    thread: StreamJobThread;
    turnId: string;
  }): Promise<void> {
    await this.messageQueueService.add<StreamAgentChatJobData>(
      STREAM_AGENT_CHAT_JOB_NAME,
      {
        ...data,
        existingTurnId: turnId,
        threadId: thread.id,
        hasTitle: isNonEmptyString(thread.title),
        conversationSizeTokens: thread.conversationSize,
      },
    );
  }

  private async releaseClaimOnEnqueueFailure<TResult>(
    { modelId, ...claim }: AgentChatStreamClaim & { modelId?: string },
    enqueue: () => Promise<TResult>,
  ): Promise<TResult> {
    try {
      return await enqueue();
    } catch (error) {
      // a turn the claim already started fails with the enqueue error
      await this.streamRecoveryService.releaseStreamClaim({
        ...claim,
        turnError: mapErrorToStreamError(error),
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
        `[AI_CHAT_TURN_FAILED] failurePhase=enqueue, model=${model}, threadId=${claim.threadId}, workspaceId=${claim.workspaceId}: ${formatErrorWithCause(error)}`,
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
        metadata: {
          createdAt: new Date(message.createdAt).toISOString(),
          senderUserWorkspaceId: message.senderUserWorkspaceId,
        },
      })),
    );

    // contexts open their thread, and Google and Bedrock only take system messages ahead of the conversation
    return [
      ...contexts.map(
        (context, index): ExtendedUIMessage => ({
          id: `context-${index}`,
          role: 'system',
          parts: [{ type: 'text', text: context }],
        }),
      ),
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
