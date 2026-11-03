import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { AgentChatAudience } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-audience.enum';
import { AgentChatReplyDecision } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-reply-decision.enum';
import { resolveAgentChatAssistantParticipation } from 'src/engine/metadata-modules/ai/ai-chat/utils/resolve-agent-chat-assistant-participation.util';

export const resolveAgentChatReplyDecision = ({
  mode,
  audience,
  isAssistantParticipant,
  isAssistantMentioned,
  isReplyRequested = true,
}: {
  mode: AiChatAssistantMode;
  audience: AgentChatAudience;
  isAssistantParticipant: boolean;
  isAssistantMentioned: boolean;
  isReplyRequested?: boolean;
}): AgentChatReplyDecision => {
  if (audience === AgentChatAudience.ASSISTANT_CHAT) {
    return AgentChatReplyDecision.ASSISTANT_CHAT_REPLY;
  }

  if (!isReplyRequested) {
    return AgentChatReplyDecision.SKIP;
  }

  if (mode === AiChatAssistantMode.NEVER) {
    return AgentChatReplyDecision.SKIP;
  }

  if (isAssistantMentioned) {
    return AgentChatReplyDecision.REPLY;
  }

  if (mode === AiChatAssistantMode.MENTION_ONLY) {
    return AgentChatReplyDecision.SKIP;
  }

  const isAssistantParticipating = resolveAgentChatAssistantParticipation({
    mode,
    audience,
    isAssistantParticipant,
    isAssistantMentioned,
  });

  return isAssistantParticipating
    ? AgentChatReplyDecision.EVALUATE
    : AgentChatReplyDecision.SKIP;
};
