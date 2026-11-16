import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentChatStreamClaimService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-claim.service';
import { isNonEmptyString } from '@sniptt/guards';
import { AgentChatQueueService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-queue.service';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { PermissionsException } from 'src/engine/permissions/permissions.exception';
import { AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { Injectable } from '@nestjs/common';
import { type TextUIPart } from 'ai';

import {
  AgentChatThreadConversationType,
  type ExtendedUIMessage,
} from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { mapDBPartsToUIMessageParts } from 'src/engine/metadata-modules/ai/ai-history/utils/map-db-parts-to-ui-message-parts.util';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsing-context.type';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { STREAM_AGENT_CHAT_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat-job-name.constant';
import { type StreamAgentChatJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat-job.types';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentConversationReaderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-reader.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';

@Injectable()
export class AgentChatStreamingService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.aiStreamQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly agentChatService: AgentChatService,
    private readonly agentChatQueueService: AgentChatQueueService,
    private readonly threadService: AgentChatThreadService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly conversationReaderService: AgentConversationReaderService,
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
    private readonly actorService: AgentChatActorService,
    private readonly turnRecorderService: AgentTurnRecorderService,
    private readonly agentRunSuspensionService: AgentRunSuspensionService,
    private readonly streamClaimService: AgentChatStreamClaimService,
  ) {}

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

    return this.streamClaimService.claimAndStartStream({
      threadId,
      workspaceId,
      modelId,
      startStream: async (streamId) => {
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
    });
  }

  async retryLastFailedTurn({
    threadId,
    userWorkspaceId,
    workspaceMemberId,
    workspace,
    modelId,
    browsingContext,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceMemberId: string;
    workspace: Pick<WorkspaceEntity, 'id'>;
    modelId?: string;
    browsingContext?: BrowsingContextType | null;
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

    const started = await this.streamClaimService.claimAndStartStream({
      threadId,
      workspaceId,
      modelId,
      startStream: async (streamId) => {
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
          threadId,
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
          browsingContext,
        });

        return { streamId, messageId: message?.id ?? null, turnId };
      },
    });

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

    await this.streamClaimService.claimAndStartStream({
      threadId,
      workspaceId,
      startStream: async (streamId) => {
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
      },
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
        select: ['id', 'title', 'conversationType', 'conversationSize'],
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
        hasTitle:
          thread.conversationType ===
            AgentChatThreadConversationType.DIRECT_MESSAGE ||
          isNonEmptyString(thread.title),
        conversationSizeTokens: thread.conversationSize,
      },
      {
        workspaceId,
        isWorkspaceJob: true,
      },
    );
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
        const { authContext } =
          await this.actorService.resolveAuthorizedConversation({
            workspaceId,
            threadId,
            sender,
          });

        return {
          message,
          userWorkspaceId: sender.userWorkspaceId,
          workspaceMemberId: authContext.workspaceMemberId,
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
        role: message.role,
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
}
