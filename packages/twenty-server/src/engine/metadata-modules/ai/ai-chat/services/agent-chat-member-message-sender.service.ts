import { Injectable } from '@nestjs/common';
import { FeatureFlagKey } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { AgentChatAssistantParticipationService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-assistant-participation.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatInboxDeliveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox-delivery.service';
import { AgentChatMemberMessageWriterService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-member-message-writer.service';
import { AgentChatQueueService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-queue.service';
import { AgentChatStreamClaimService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-claim.service';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatThreadLifecycleService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-lifecycle.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentChatTurnPreflightService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-turn-preflight.service';
import { type AgentChatAssistantParticipation } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-participation.type';
import { type AgentChatMemberMessageResult } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-member-message-result.type';
import { type AgentChatMemberMessageSendArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-member-message-send-args.type';
import { tagAiChatStreamScope } from 'src/engine/metadata-modules/ai/ai-chat/utils/tag-ai-chat-stream-scope.util';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Injectable()
export class AgentChatMemberMessageSenderService {
  constructor(
    private readonly threadService: AgentChatThreadService,
    private readonly participationService: AgentChatAssistantParticipationService,
    private readonly messageWriterService: AgentChatMemberMessageWriterService,
    private readonly inboxDeliveryService: AgentChatInboxDeliveryService,
    private readonly streamingService: AgentChatStreamingService,
    private readonly queueService: AgentChatQueueService,
    private readonly streamClaimService: AgentChatStreamClaimService,
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
    private readonly turnPreflightService: AgentChatTurnPreflightService,
    private readonly threadLifecycleService: AgentChatThreadLifecycleService,
    private readonly runSuspensionService: AgentRunSuspensionService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

  async send({
    actor,
    target,
    message,
    addressing,
    assistant,
    execution,
  }: AgentChatMemberMessageSendArgs): Promise<AgentChatMemberMessageResult> {
    const access = {
      workspaceId: actor.workspaceId,
      workspaceMemberId: actor.workspaceMemberId,
      threadId: target.threadId,
    };
    const isInboxEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
      actor.workspaceId,
    );
    const participationIntent = {
      isAssistantMentioned: assistant.isMentioned,
      isInitialAssistantParticipant: assistant.isInitiallyIncluded,
      mentionedWorkspaceMemberIds: addressing.mentionedWorkspaceMemberIds,
      recipientWorkspaceMemberIds:
        addressing.initialRecipientWorkspaceMemberIds,
    };

    await this.threadService.createThreadIfMissing({
      ...access,
      channelId: target.channelId,
      shouldApplyAssistantParticipation: false,
      ...participationIntent,
    });

    const thread = await this.threadService.getWritableThread(access);
    const participation = await this.participationService.resolve({
      ...actor,
      thread,
      ...participationIntent,
    });

    const shouldReply = assistant.isReplyRequested || !isInboxEnabled;

    if (shouldReply) {
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
    }

    if (isDefined(thread.deletedAt)) {
      await this.threadService.restoreThread(access);
    }

    const interruptedError = await this.streamRecoveryService.reapDeadStream({
      thread,
      workspaceId: actor.workspaceId,
    });

    if (isDefined(interruptedError)) {
      thread.activeStreamId = null;
    }

    const write = {
      actor,
      thread,
      message,
      addressing: isInboxEnabled ? addressing : undefined,
      participation,
    };
    const result: AgentChatMemberMessageResult = shouldReply
      ? await this.sendWithReply({ ...write, execution })
      : await this.messageWriterService
          .write({
            ...write,
            placement: 'completed',
          })
          .then((savedMessage) => ({
            messageId: savedMessage.id,
            queued: false,
            delivery: savedMessage.delivery,
          }));

    if (!isInboxEnabled) {
      result.delivery = await this.inboxDeliveryService.deliver({
        ...access,
        messageId: result.messageId,
        mentionedWorkspaceMemberIds: addressing.mentionedWorkspaceMemberIds,
        initialRecipientWorkspaceMemberIds: [],
      });
    }

    if (isDefined(result.streamId) && isDefined(result.turnId)) {
      tagAiChatStreamScope({
        ...access,
        streamId: result.streamId,
        turnId: result.turnId,
      });
    }

    return result;
  }

  private async sendWithReply({
    actor,
    thread,
    message,
    addressing,
    participation,
    execution,
  }: Pick<AgentChatMemberMessageSendArgs, 'actor' | 'message' | 'execution'> & {
    addressing?: AgentChatMemberMessageSendArgs['addressing'];
    thread: AgentChatThreadWorkspaceEntity;
    participation?: AgentChatAssistantParticipation;
  }): Promise<AgentChatMemberMessageResult> {
    const access = { workspaceId: actor.workspaceId, threadId: thread.id };
    const [conversationWait, hasQueuedBacklog] = await Promise.all([
      this.runSuspensionService.findConversationWait({ ...access, thread }),
      this.queueService.hasQueuedMessages(access),
    ]);

    if (conversationWait.hasPostedCall) {
      throw new AiException(
        'The conversation is waiting on an answer; answer it before sending a message',
        AiExceptionCode.THREAD_AWAITING_ANSWER,
      );
    }

    if (isDefined(conversationWait.pendingQuestionMessageId)) {
      await this.threadLifecycleService.closePendingQuestion({
        ...access,
        messageId: conversationWait.pendingQuestionMessageId,
        activeStreamId: null,
        turnStatus: AgentTurnStatus.COMPLETED,
      });
    }

    const write = { actor, thread, message, addressing, participation };
    const started =
      hasQueuedBacklog || isDefined(conversationWait.suspendedRun)
        ? null
        : await this.streamClaimService.run({
            ...access,
            modelId: execution.modelId,
            start: async (streamId) => {
              const savedMessage = await this.messageWriterService.write({
                ...write,
                placement: 'running',
              });

              assertIsDefinedOrThrow(savedMessage.turnId);

              await this.streamingService.enqueueStreamJob({
                ...actor,
                ...access,
                ...execution,
                streamId,
                turnId: savedMessage.turnId,
                messageId: savedMessage.id,
              });

              return {
                messageId: savedMessage.id,
                queued: false,
                streamId,
                turnId: savedMessage.turnId,
                delivery: savedMessage.delivery,
              };
            },
          });

    if (isDefined(started)) {
      return started;
    }

    const queuedMessage = await this.messageWriterService.write({
      ...write,
      placement: 'queued',
    });

    if (isDefined(conversationWait.suspendedRun)) {
      await this.runSuspensionService.scheduleContinuation({
        ...access,
        wakeUpId: conversationWait.suspendedRun.id,
        outcome: { type: 'MESSAGE_RECEIVED' },
      });
    } else {
      await this.streamingService.flushNextQueuedMessage(access);
    }

    await this.eventPublisherService.publish({
      ...access,
      event: { type: 'queue-updated' },
    });

    return {
      messageId: queuedMessage.id,
      queued: true,
      delivery: queuedMessage.delivery,
    };
  }
}
