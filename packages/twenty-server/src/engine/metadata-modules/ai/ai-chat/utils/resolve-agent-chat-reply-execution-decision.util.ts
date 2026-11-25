import { isDefined } from 'twenty-shared/utils';

import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { type AgentChatAssistantReplyContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-reply-context.type';
import { AgentChatAudience } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-audience.enum';
import { AgentChatReplyDecision } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-reply-decision.enum';
import { AgentChatReplyExecutionDecision } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-reply-execution-decision.enum';
import { resolveAgentChatReplyDecision } from 'src/engine/metadata-modules/ai/ai-chat/utils/resolve-agent-chat-reply-decision.util';

export const resolveAgentChatReplyExecutionDecision = ({
  mode,
  audience,
  isAssistantParticipant,
  context,
}: {
  mode: AiChatAssistantMode;
  audience: AgentChatAudience;
  isAssistantParticipant: boolean;
  context?: AgentChatAssistantReplyContext;
}): AgentChatReplyExecutionDecision => {
  if (!isDefined(context)) {
    return audience === AgentChatAudience.ASSISTANT_CHAT ||
      mode !== AiChatAssistantMode.NEVER
      ? AgentChatReplyExecutionDecision.EXECUTE
      : AgentChatReplyExecutionDecision.SKIP;
  }

  const hasAssistantChatExemption =
    context.isDirectAssistantChat || context.isStructuredRequestContinuation;
  const effectiveAudience =
    audience === AgentChatAudience.ASSISTANT_CHAT && !hasAssistantChatExemption
      ? AgentChatAudience.CONVERSATION
      : audience;
  const replyDecision = resolveAgentChatReplyDecision({
    mode,
    audience: effectiveAudience,
    isAssistantParticipant,
    isAssistantMentioned:
      context.isAssistantMentioned || context.isStructuredRequestContinuation,
  });

  if (replyDecision === AgentChatReplyDecision.SKIP) {
    return AgentChatReplyExecutionDecision.SKIP;
  }

  if (replyDecision !== AgentChatReplyDecision.EVALUATE) {
    return AgentChatReplyExecutionDecision.EXECUTE;
  }

  return context.isDirectAssistantChat
    ? AgentChatReplyExecutionDecision.REEVALUATE
    : AgentChatReplyExecutionDecision.EXECUTE;
};
