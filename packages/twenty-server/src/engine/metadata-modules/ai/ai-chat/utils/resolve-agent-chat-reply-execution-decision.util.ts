import { isDefined } from 'twenty-shared/utils';

import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { type AgentChatAssistantReplyContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-reply-context.type';
import { type AgentChatAudience } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-audience.type';
import { type AgentChatReplyExecutionDecision } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-reply-execution-decision.type';
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
    return audience === 'assistant-chat' || mode !== AiChatAssistantMode.NEVER
      ? 'EXECUTE'
      : 'SKIP';
  }

  const hasAssistantChatExemption =
    context.isDirectAssistantChat || context.isStructuredRequestContinuation;
  const effectiveAudience =
    audience === 'assistant-chat' && !hasAssistantChatExemption
      ? 'conversation'
      : audience;
  const replyDecision = resolveAgentChatReplyDecision({
    mode,
    audience: effectiveAudience,
    isAssistantParticipant,
    isAssistantMentioned:
      context.isAssistantMentioned || context.isStructuredRequestContinuation,
  });

  if (replyDecision === 'SKIP') {
    return 'SKIP';
  }

  if (replyDecision !== 'EVALUATE') {
    return 'EXECUTE';
  }

  return context.isDirectAssistantChat ? 'REEVALUATE' : 'EXECUTE';
};
