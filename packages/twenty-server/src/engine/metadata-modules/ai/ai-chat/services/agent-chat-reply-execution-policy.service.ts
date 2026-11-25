import { Injectable } from '@nestjs/common';

import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { AgentChatReplyDecision } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-reply-decision.enum';
import { AgentChatReplyExecutionDecision } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-reply-execution-decision.enum';
import { AgentChatAssistantPolicyService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-assistant-policy.service';
import { AgentChatReplyPolicyService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-reply-policy.service';
import { readAgentChatAssistantReplyContext } from 'src/engine/metadata-modules/ai/ai-chat/utils/read-agent-chat-assistant-reply-context.util';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';

@Injectable()
export class AgentChatReplyExecutionPolicyService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    private readonly assistantPolicyService: AgentChatAssistantPolicyService,
    private readonly replyPolicyService: AgentChatReplyPolicyService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async shouldExecute({
    threadId,
    workspaceId,
    userWorkspaceId,
    messageId,
  }: {
    threadId: string;
    workspaceId: string;
    userWorkspaceId: string;
    messageId?: string;
  }): Promise<boolean> {
    const [thread, message] = await Promise.all([
      this.threadRepository.findOneOrFail(workspaceId, {
        where: { id: threadId },
      }),
      isDefined(messageId)
        ? this.messageRepository.findOne(workspaceId, {
            where: { id: messageId, threadId, role: AgentMessageRole.USER },
            relations: ['parts'],
          })
        : Promise.resolve(null),
    ]);

    if (isDefined(messageId) && !isDefined(message)) {
      return false;
    }

    if (
      thread.conversationType !==
        AgentChatThreadConversationType.DIRECT_MESSAGE &&
      !(await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
        workspaceId,
      ))
    ) {
      return true;
    }

    const context = readAgentChatAssistantReplyContext(message?.parts);
    const decision =
      await this.assistantPolicyService.resolveReplyExecutionDecision({
        workspaceId,
        thread,
        context,
      });

    if (decision !== AgentChatReplyExecutionDecision.REEVALUATE) {
      return decision === AgentChatReplyExecutionDecision.EXECUTE;
    }

    const text = (message?.parts ?? [])
      .filter((part) => part.type === 'text')
      .map((part) => part.textContent ?? '')
      .join('\n');

    return this.replyPolicyService.shouldReply({
      decision: AgentChatReplyDecision.EVALUATE,
      threadId,
      pendingQuestionMessageId: thread.pendingQuestionMessageId,
      workspaceId,
      userWorkspaceId,
      text,
    });
  }
}
