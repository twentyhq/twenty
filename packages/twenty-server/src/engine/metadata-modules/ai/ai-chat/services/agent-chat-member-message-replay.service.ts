import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { AgentChatAssistantParticipationService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-assistant-participation.service';
import { AgentChatInboxDeliveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox-delivery.service';
import { AgentChatReplyPolicyService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-reply-policy.service';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatTurnPreflightService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-turn-preflight.service';
import { type AgentChatAssistantParticipation } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-participation.type';
import { type AgentChatAssistantReplyPolicyArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-reply-policy-args.type';
import { type AgentChatMemberMessageResult } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-member-message-result.type';
import { type AgentChatMemberMessageSendArguments } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-member-message-send-arguments.type';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';

@Injectable()
export class AgentChatMemberMessageReplayService {
  constructor(
    private readonly assistantParticipationService: AgentChatAssistantParticipationService,
    private readonly inboxDeliveryService: AgentChatInboxDeliveryService,
    private readonly chatStreamingService: AgentChatStreamingService,
    private readonly turnPreflightService: AgentChatTurnPreflightService,
    private readonly replyPolicyService: AgentChatReplyPolicyService,
    private readonly turnRecorderService: AgentTurnRecorderService,
  ) {}

  async replayStoredMessage({
    storedMessage,
    execution,
    addressing,
    ...assistantReplyPolicyArgs
  }: AgentChatAssistantReplyPolicyArgs &
    Pick<
      AgentChatMemberMessageSendArguments,
      'actor' | 'execution' | 'addressing'
    > & {
      thread: AgentChatThreadWorkspaceEntity;
      participation: AgentChatAssistantParticipation;
      storedMessage: AgentMessageWorkspaceEntity;
    }): Promise<AgentChatMemberMessageResult> {
    const { actor, thread, participation } = assistantReplyPolicyArgs;

    if (participation.isInitialMessage) {
      await this.assistantParticipationService.persistAssistantParticipation({
        workspaceId: actor.workspaceId,
        thread,
        participation,
      });
    }

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
      !participation.isInitialMessage ||
      storedTurn?.status !== AgentTurnStatus.FAILED ||
      !(await this.replyPolicyService.shouldGenerateAssistantReply(
        assistantReplyPolicyArgs,
      ))
    ) {
      return storedResult;
    }

    const restartedTurn = await this.chatStreamingService.retryLastFailedTurn({
      threadId: thread.id,
      userWorkspaceId: actor.userWorkspaceId,
      workspaceMemberId: actor.workspaceMemberId,
      workspace:
        await this.turnPreflightService.getWorkspaceReadyForAgentTurnOrThrow({
          workspaceId: actor.workspaceId,
          userWorkspaceId: actor.userWorkspaceId,
          modelId: execution.modelId,
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
}
