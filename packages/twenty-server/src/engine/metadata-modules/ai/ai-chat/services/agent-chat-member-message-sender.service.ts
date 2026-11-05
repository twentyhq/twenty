import { type AgentChatAssistantReplyContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-reply-context.type';
import { AgentChatReplyPolicyService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-reply-policy.service';
import { AgentChatMemberMessagePlacement } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-member-message-placement.enum';
import { AgentChatReplyDecision } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-reply-decision.enum';
import { Injectable } from '@nestjs/common';
import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { FeatureFlagKey } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { AgentChatAssistantParticipationService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-assistant-participation.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatInboxDeliveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox-delivery.service';
import { AgentChatMemberMessagePartsService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-member-message-parts.service';
import { AgentChatMemberMessageWriterService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-member-message-writer.service';
import { AgentChatQueueService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-queue.service';
import { AgentChatStreamClaimService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-claim.service';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatThreadLifecycleService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-lifecycle.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentChatTurnPreflightService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-turn-preflight.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { type AgentChatAssistantParticipation } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-participation.type';
import { type AgentChatMemberMessageActor } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-member-message-actor.type';
import { type AgentChatMemberMessageResult } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-member-message-result.type';
import { type AgentChatMemberMessageSendArguments } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-member-message-send-arguments.type';
import { type AgentChatPreparedMemberMessage } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-prepared-member-message.type';
import { tagAiChatStreamScope } from 'src/engine/metadata-modules/ai/ai-chat/utils/tag-ai-chat-stream-scope.util';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

type AssistantReplyPolicyInput = {
  actor: AgentChatMemberMessageActor;
  thread: AgentChatThreadWorkspaceEntity;
  participation: AgentChatAssistantParticipation;
  isInboxEnabled: boolean;
  text: string;
};

@Injectable()
export class AgentChatMemberMessageSenderService {
  constructor(
    private readonly chatThreadService: AgentChatThreadService,
    private readonly assistantParticipationService: AgentChatAssistantParticipationService,
    private readonly memberMessageWriterService: AgentChatMemberMessageWriterService,
    private readonly inboxDeliveryService: AgentChatInboxDeliveryService,
    private readonly chatStreamingService: AgentChatStreamingService,
    private readonly chatMessageQueueService: AgentChatQueueService,
    private readonly streamClaimService: AgentChatStreamClaimService,
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
    private readonly turnPreflightService: AgentChatTurnPreflightService,
    private readonly threadLifecycleService: AgentChatThreadLifecycleService,
    private readonly runSuspensionService: AgentRunSuspensionService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
    private readonly memberMessagePartsService: AgentChatMemberMessagePartsService,
    private readonly replyPolicyService: AgentChatReplyPolicyService,
    private readonly agentChatService: AgentChatService,
    private readonly turnRecorderService: AgentTurnRecorderService,
  ) {}

  async sendMemberMessage({
    actor,
    target,
    message,
    addressing,
    assistant,
    execution,
  }: AgentChatMemberMessageSendArguments): Promise<AgentChatMemberMessageResult> {
    const preparedMessage =
      await this.memberMessagePartsService.prepareMemberMessage({
        workspaceId: actor.workspaceId,
        message,
      });
    const threadAccess = {
      workspaceId: actor.workspaceId,
      workspaceMemberId: actor.workspaceMemberId,
      threadId: target.threadId,
    };
    const isInboxEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
      actor.workspaceId,
    );
    const assistantParticipationInput = {
      isAssistantMentioned: assistant.isMentioned,
      isInitialAssistantParticipant: assistant.isInitiallyIncluded,
      mentionedWorkspaceMemberIds: addressing.mentionedWorkspaceMemberIds,
      recipientWorkspaceMemberIds:
        addressing.initialRecipientWorkspaceMemberIds,
    };

    await this.chatThreadService.createThreadIfMissing({
      ...threadAccess,
      channelId: target.channelId ?? undefined,
      shouldApplyAssistantParticipation: false,
    });

    const storedMessage = isDefined(message.id)
      ? await this.agentChatService.findMemberMessage({
          ...threadAccess,
          messageId: message.id,
        })
      : null;
    const isInitialMessage = !(await this.agentChatService.hasMessages({
      workspaceId: actor.workspaceId,
      threadId: target.threadId,
      excludedMessage: storedMessage ?? undefined,
    }));
    const thread =
      isInitialMessage && !isUndefined(target.channelId)
        ? await this.chatThreadService.moveOwnThreadToChannel({
            ...threadAccess,
            channelId: target.channelId,
          })
        : await this.chatThreadService.getWritableThread(threadAccess);
    const participation =
      await this.assistantParticipationService.resolveAssistantParticipation({
        workspaceId: actor.workspaceId,
        workspaceMemberId: actor.workspaceMemberId,
        thread,
        isInitialMessage,
        ...assistantParticipationInput,
        isReplyRequested: assistant.isReplyRequested,
      });
    const assistantReplyPolicyInput = {
      actor,
      thread,
      participation,
      isInboxEnabled,
      text: message.text,
    };

    if (isInitialMessage && isDefined(storedMessage)) {
      return this.replayStoredFirstMessage({
        ...assistantReplyPolicyInput,
        storedMessage,
        execution,
        addressing: isInboxEnabled
          ? addressing
          : { ...addressing, initialRecipientWorkspaceMemberIds: [] },
      });
    }

    const replyDecision = participation.replyDecision;
    const shouldGenerateAssistantReply =
      await this.shouldGenerateAssistantReply(assistantReplyPolicyInput);

    if (shouldGenerateAssistantReply) {
      await this.getWorkspaceReadyForAgentTurnOrThrow({ actor, execution });
    }

    if (isDefined(thread.deletedAt)) {
      await this.chatThreadService.restoreThread(threadAccess);
    }

    const interruptedStreamError =
      await this.streamRecoveryService.reapDeadStream({
        thread,
        workspaceId: actor.workspaceId,
      });

    if (isDefined(interruptedStreamError)) {
      thread.activeStreamId = null;
    }

    const memberMessageWriteInput = {
      actor,
      thread,
      message: preparedMessage,
      addressing: isInboxEnabled ? addressing : undefined,
      participation,
      assistantReplyContext: {
        isAssistantMentioned: assistant.isMentioned,
        isDirectAssistantChat:
          replyDecision === AgentChatReplyDecision.ASSISTANT_CHAT_REPLY,
        isStructuredRequestContinuation: false,
      },
    };
    let result: AgentChatMemberMessageResult;

    if (shouldGenerateAssistantReply) {
      result = await this.sendMessageWithAssistantReply({
        ...memberMessageWriteInput,
        execution,
      });
    } else {
      const persistedMessage =
        await this.memberMessageWriterService.writeMemberMessage({
          ...memberMessageWriteInput,
          placement: AgentChatMemberMessagePlacement.COMPLETED,
        });

      result = {
        messageId: persistedMessage.id,
        isQueued: false,
        delivery: persistedMessage.delivery,
      };
    }

    if (!isInboxEnabled) {
      result.delivery = await this.inboxDeliveryService.deliverMessageToInboxes(
        {
          ...threadAccess,
          messageId: result.messageId,
          mentionedWorkspaceMemberIds: addressing.mentionedWorkspaceMemberIds,
          initialRecipientWorkspaceMemberIds: [],
        },
      );
    }

    if (isDefined(result.streamId) && isDefined(result.turnId)) {
      tagAiChatStreamScope({
        ...threadAccess,
        streamId: result.streamId,
        turnId: result.turnId,
      });
    }

    return result;
  }

  private async shouldGenerateAssistantReply({
    actor,
    thread,
    participation,
    isInboxEnabled,
    text,
  }: AssistantReplyPolicyInput): Promise<boolean> {
    if (!isInboxEnabled) {
      return true;
    }

    return this.replyPolicyService.shouldReply({
      decision: participation.replyDecision,
      threadId: thread.id,
      pendingQuestionMessageId: thread.pendingQuestionMessageId,
      workspaceId: actor.workspaceId,
      userWorkspaceId: actor.userWorkspaceId,
      text,
    });
  }

  private async getWorkspaceReadyForAgentTurnOrThrow({
    actor,
    execution,
  }: Pick<
    AgentChatMemberMessageSendArguments,
    'actor' | 'execution'
  >): Promise<FlatWorkspace> {
    const workspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      actor.workspaceId,
    );

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.turnPreflightService.assertCanRunAgentTurn({
      workspace,
      userWorkspaceId: actor.userWorkspaceId,
      modelId: execution.modelId,
    });

    return workspace;
  }

  private async replayStoredFirstMessage({
    storedMessage,
    execution,
    addressing,
    ...assistantReplyPolicyInput
  }: AssistantReplyPolicyInput &
    Pick<AgentChatMemberMessageSendArguments, 'execution' | 'addressing'> & {
      storedMessage: AgentMessageWorkspaceEntity;
    }): Promise<AgentChatMemberMessageResult> {
    const { actor, thread, participation } = assistantReplyPolicyInput;

    await this.assistantParticipationService.persistAssistantParticipation({
      workspaceId: actor.workspaceId,
      thread,
      participation,
    });

    const storedResult = {
      messageId: storedMessage.id,
      isQueued: storedMessage.status === AgentMessageStatus.QUEUED,
      delivery: await this.inboxDeliveryService.deliverMessageToInboxes({
        workspaceId: actor.workspaceId,
        workspaceMemberId: actor.workspaceMemberId,
        threadId: thread.id,
        messageId: storedMessage.id,
        ...addressing,
      }),
    };
    const storedTurn = isDefined(storedMessage.turnId)
      ? await this.turnRecorderService.findTurn({
          workspaceId: actor.workspaceId,
          turnId: storedMessage.turnId,
        })
      : null;

    if (
      storedTurn?.status === AgentTurnStatus.RUNNING &&
      isNonEmptyString(thread.activeStreamId)
    ) {
      return {
        ...storedResult,
        streamId: thread.activeStreamId,
        turnId: storedTurn.id,
      };
    }

    if (
      storedTurn?.status !== AgentTurnStatus.FAILED ||
      !(await this.shouldGenerateAssistantReply(assistantReplyPolicyInput))
    ) {
      return storedResult;
    }

    const restartedTurn = await this.chatStreamingService.retryLastFailedTurn({
      threadId: thread.id,
      userWorkspaceId: actor.userWorkspaceId,
      workspaceMemberId: actor.workspaceMemberId,
      workspace: await this.getWorkspaceReadyForAgentTurnOrThrow({
        actor,
        execution,
      }),
      modelId: execution.modelId,
      browsingContext: execution.browsingContext,
    });

    return {
      ...storedResult,
      streamId: restartedTurn.streamId,
      turnId: restartedTurn.turnId,
    };
  }

  private async sendMessageWithAssistantReply({
    actor,
    thread,
    message,
    addressing,
    participation,
    execution,
    assistantReplyContext,
  }: Pick<AgentChatMemberMessageSendArguments, 'actor' | 'execution'> & {
    message: AgentChatPreparedMemberMessage;
    addressing?: AgentChatMemberMessageSendArguments['addressing'];
    thread: AgentChatThreadWorkspaceEntity;
    assistantReplyContext?: AgentChatAssistantReplyContext;
    participation?: Pick<
      AgentChatAssistantParticipation,
      'isAssistantParticipant' | 'isInitialMessage'
    >;
  }): Promise<AgentChatMemberMessageResult> {
    const threadAccess = {
      workspaceId: actor.workspaceId,
      threadId: thread.id,
    };
    const [conversationWait, hasQueuedBacklog] = await Promise.all([
      this.runSuspensionService.findConversationWait({
        ...threadAccess,
        thread,
      }),
      this.chatMessageQueueService.hasQueuedMessages(threadAccess),
    ]);

    if (conversationWait.hasPostedCall) {
      throw new AiException(
        'The conversation is waiting on an answer; answer it before sending a message',
        AiExceptionCode.THREAD_AWAITING_ANSWER,
      );
    }

    if (isDefined(conversationWait.pendingQuestionMessageId)) {
      await this.threadLifecycleService.closePendingQuestion({
        ...threadAccess,
        messageId: conversationWait.pendingQuestionMessageId,
        activeStreamId: null,
        turnStatus: AgentTurnStatus.COMPLETED,
      });
    }

    const memberMessageWriteInput = {
      actor,
      thread,
      message,
      addressing,
      participation,
      assistantReplyContext,
    };
    const startedAssistantReply =
      hasQueuedBacklog || isDefined(conversationWait.suspendedRun)
        ? null
        : await this.streamClaimService.claimAndStartStream({
            ...threadAccess,
            modelId: execution.modelId,
            startStream: async (streamId) => {
              const persistedMessage =
                await this.memberMessageWriterService.writeMemberMessage({
                  ...memberMessageWriteInput,
                  placement: AgentChatMemberMessagePlacement.RUNNING,
                });

              assertIsDefinedOrThrow(persistedMessage.turnId);

              await this.chatStreamingService.enqueueStreamJob({
                ...actor,
                ...threadAccess,
                ...execution,
                streamId,
                turnId: persistedMessage.turnId,
                messageId: persistedMessage.id,
              });

              return {
                messageId: persistedMessage.id,
                isQueued: false,
                streamId,
                turnId: persistedMessage.turnId,
                delivery: persistedMessage.delivery,
              };
            },
          });

    if (isDefined(startedAssistantReply)) {
      return startedAssistantReply;
    }

    const queuedMemberMessage =
      await this.memberMessageWriterService.writeMemberMessage({
        ...memberMessageWriteInput,
        placement: AgentChatMemberMessagePlacement.QUEUED,
      });

    if (isDefined(conversationWait.suspendedRun)) {
      await this.runSuspensionService.scheduleContinuation({
        ...threadAccess,
        wakeUpId: conversationWait.suspendedRun.id,
        outcome: { type: 'MESSAGE_RECEIVED' },
      });
    } else {
      await this.chatStreamingService.flushNextQueuedMessage(threadAccess);
    }

    await this.eventPublisherService.publish({
      ...threadAccess,
      event: { type: 'queue-updated' },
    });

    return {
      messageId: queuedMemberMessage.id,
      isQueued: true,
      delivery: queuedMemberMessage.delivery,
    };
  }
}
