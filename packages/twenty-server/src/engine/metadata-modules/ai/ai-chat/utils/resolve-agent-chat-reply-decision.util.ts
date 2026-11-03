import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { type AgentChatAudience } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-audience.type';
import { type AgentChatReplyDecision } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-reply-decision.type';
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
  if (audience === 'assistant-chat') {
    return 'ASSISTANT_CHAT_REPLY';
  }

  if (!isReplyRequested) {
    return 'SKIP';
  }

  if (mode === AiChatAssistantMode.NEVER) {
    return 'SKIP';
  }

  if (isAssistantMentioned) {
    return 'REPLY';
  }

  if (mode === AiChatAssistantMode.MENTION_ONLY) {
    return 'SKIP';
  }

  const isAssistantParticipating = resolveAgentChatAssistantParticipation({
    mode,
    audience,
    isAssistantParticipant,
    isAssistantMentioned,
  });

  return isAssistantParticipating ? 'EVALUATE' : 'SKIP';
};
