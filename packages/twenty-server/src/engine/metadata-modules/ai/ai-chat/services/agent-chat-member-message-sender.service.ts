import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { doNotTranslate } from 'twenty-shared/i18n';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { type AgentChatAssistantReplyContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-reply-context.type';
import { AgentChatReplyPolicyService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-reply-policy.service';
import { AgentChatMemberMessagePlacement } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-member-message-placement.enum';
import { AgentChatReplyDecision } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-reply-decision.enum';
import { Injectable } from '@nestjs/common';
import { isUndefined } from '@sniptt/guards';
import { FeatureFlagKey } from 'twenty-shared/types';
import {
  assertIsDefinedOrThrow,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { AgentChatAssistantParticipationService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-assistant-participation.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatInboxDeliveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox-delivery.service';
import { AgentChatMemberMessagePartsService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-member-message-parts.service';
import { AgentChatMemberMessageReplayService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-member-message-replay.service';
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
import { type AgentChatMemberMessageResult } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-member-message-result.type';
import { type AgentChatMemberMessageSendArguments } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-member-message-send-arguments.type';
import { type AgentChatPreparedMemberMessage } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-prepared-member-message.type';
import { isAgentChatDirectMessageAddressedWithinPair } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-agent-chat-direct-message-addressed-within-pair.util';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

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
    private readonly memberMessagePartsService: AgentChatMemberMessagePartsService,
    private readonly replyPolicyService: AgentChatReplyPolicyService,
    private readonly agentChatService: AgentChatService,
    private readonly memberMessageReplayService: AgentChatMemberMessageReplayService,
  ) {}

  async sendMemberMessage({
    actor,
    target,
    message,
    addressing,
    assistant,
    execution,
  }: AgentChatMemberMessageSendArguments): Promise<AgentChatMemberMessageResult> {
    const threadAccess = {
      workspaceId: actor.workspaceId,
      workspaceMemberId: actor.workspaceMemberId,
      threadId: target.threadId,
    };
    const isInboxEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
      actor.workspaceId,
    );
    const preparedMessage =
      await this.memberMessagePartsService.prepareMemberMessage({
        workspaceId: actor.workspaceId,
        message,
      });

    const shouldValidateRecipients =
      !assistant.isInitiallyIncluded &&
      !assistant.isMentioned &&
      !isDefined(target.channelId) &&
      (isNonEmptyArray(addressing.initialRecipientWorkspaceMemberIds) ||
        isNonEmptyArray(addressing.mentionedWorkspaceMemberIds));
    const createdThread = await this.chatThreadService.createThreadIfMissing({
      ...threadAccess,
      isAssistantMentioned: assistant.isMentioned,
      isInitialAssistantParticipant: assistant.isInitiallyIncluded,
      mentionedWorkspaceMemberIds: addressing.mentionedWorkspaceMemberIds,
      recipientWorkspaceMemberIds:
        addressing.initialRecipientWorkspaceMemberIds,
      channelId: target.channelId ?? undefined,
      shouldApplyAssistantParticipation: false,
      shouldValidateRecipients,
      isReplyRequested: assistant.isReplyRequested,
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
    const writableThread =
      await this.chatThreadService.getWritableThread(threadAccess);
    const isDirectMessage =
      writableThread.conversationType ===
      AgentChatThreadConversationType.DIRECT_MESSAGE;
    const messageAddressing = { ...addressing };

    if (isDirectMessage) {
      const isDirectMessageIdentityEnabled =
        await this.featureFlagService.isFeatureEnabled(
          FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED,
          actor.workspaceId,
        );

      if (!isDirectMessageIdentityEnabled) {
        return throwAgentChatThreadNotFound();
      }

      if (
        !isAgentChatDirectMessageAddressedWithinPair({
          thread: writableThread,
          senderWorkspaceMemberId: actor.workspaceMemberId,
          addressedWorkspaceMemberIds: [
            ...addressing.mentionedWorkspaceMemberIds,
            ...addressing.initialRecipientWorkspaceMemberIds,
          ],
        })
      ) {
        return throwAgentChatThreadNotFound();
      }

      if (isNonEmptyArray(message.attachments) || isDefined(target.channelId)) {
        throw new AiException(
          doNotTranslate('Direct messages do not support files or channels'),
          AiExceptionCode.INVALID_AGENT_INPUT,
        );
      }

      messageAddressing.initialRecipientWorkspaceMemberIds = [
        writableThread.directMessageFirstWorkspaceMemberId,
        writableThread.directMessageSecondWorkspaceMemberId,
      ]
        .filter(isDefined)
        .filter((memberId) => memberId !== actor.workspaceMemberId);
    }

    const thread =
      isInitialMessage && !isUndefined(target.channelId)
        ? await this.chatThreadService.moveOwnThreadToChannel({
            ...threadAccess,
            thread: writableThread,
            channelId: target.channelId,
          })
        : writableThread;

    const participation =
      createdThread?.participation ??
      (await this.assistantParticipationService.resolveAssistantParticipation({
        workspaceId: actor.workspaceId,
        workspaceMemberId: actor.workspaceMemberId,
        thread,
        isInitialMessage,
        isAssistantMentioned: assistant.isMentioned,
        isInitialAssistantParticipant: assistant.isInitiallyIncluded,
        mentionedWorkspaceMemberIds:
          messageAddressing.mentionedWorkspaceMemberIds,
        recipientWorkspaceMemberIds:
          messageAddressing.initialRecipientWorkspaceMemberIds,
        isReplyRequested: assistant.isReplyRequested,
      }));
    const assistantReplyPolicyArgs = {
      actor,
      thread,
      participation,
      isInboxEnabled,
      isDirectMessage,
      text: message.text,
    };

    if (isDefined(storedMessage)) {
      return this.memberMessageReplayService.replayStoredMessage({
        ...assistantReplyPolicyArgs,
        storedMessage,
        execution,
        addressing: {
          ...messageAddressing,
          initialRecipientWorkspaceMemberIds:
            (isInboxEnabled && isInitialMessage) || isDirectMessage
              ? messageAddressing.initialRecipientWorkspaceMemberIds
              : [],
        },
      });
    }

    const replyDecision = participation.replyDecision;
    const shouldGenerateAssistantReply =
      await this.replyPolicyService.shouldGenerateAssistantReply(
        assistantReplyPolicyArgs,
      );

    if (shouldGenerateAssistantReply) {
      await this.turnPreflightService.getWorkspaceReadyForAgentTurnOrThrow({
        workspaceId: actor.workspaceId,
        userWorkspaceId: actor.userWorkspaceId,
        modelId: execution.modelId,
      });
    }

    if (isDefined(thread.deletedAt) && isDirectMessage) {
      await this.chatThreadService.restoreDirectMessageThread({
        workspaceId: actor.workspaceId,
        thread,
      });
    } else if (isDefined(thread.deletedAt)) {
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
      addressing:
        isInboxEnabled || isDirectMessage ? messageAddressing : undefined,
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

    if (!isInboxEnabled && !isDirectMessage) {
      result.delivery = await this.inboxDeliveryService.deliverMessageToInboxes(
        {
          ...threadAccess,
          messageId: result.messageId,
          mentionedWorkspaceMemberIds: addressing.mentionedWorkspaceMemberIds,
          initialRecipientWorkspaceMemberIds: [],
        },
      );
    }

    return result;
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
