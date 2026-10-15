import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { shouldAgentChatAssistantReply } from 'src/engine/metadata-modules/ai/ai-chat/utils/should-agent-chat-assistant-reply.util';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

@Injectable()
export class AgentChatReplyPolicyService {
  constructor(
    private readonly featureFlagService: FeatureFlagService,
    private readonly participantService: AgentChatThreadParticipantService,
  ) {}

  async shouldAssistantReply({
    thread,
    workspaceId,
    workspaceMemberId,
    isAssistantMentioned,
    mentionedWorkspaceMemberIds,
  }: {
    thread: AgentChatThreadWorkspaceEntity;
    workspaceId: string;
    workspaceMemberId: string;
    isAssistantMentioned: boolean;
    mentionedWorkspaceMemberIds: string[];
  }): Promise<boolean> {
    const isAwaitingAssistantQuestion = isDefined(
      thread.pendingQuestionMessageId,
    );

    if (isAssistantMentioned || isAwaitingAssistantQuestion) {
      return true;
    }

    const isInboxEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
      workspaceId,
    );

    if (!isInboxEnabled) {
      return true;
    }

    const memberCount = await this.participantService.countMembers({
      workspaceId,
      threadId: thread.id,
      workspaceMemberIds: [workspaceMemberId, ...mentionedWorkspaceMemberIds],
    });

    return shouldAgentChatAssistantReply({
      isInboxEnabled,
      isAssistantMentioned,
      isAwaitingAssistantQuestion,
      memberCount,
    });
  }
}
