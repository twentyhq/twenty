import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { type AgentChatReplyDecision } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-reply-decision.type';
import { resolveAgentChatAssistantParticipation } from 'src/engine/metadata-modules/ai/ai-chat/utils/resolve-agent-chat-assistant-participation.util';

export const resolveAgentChatReplyDecision = ({
  mode,
  isDirectAssistantChat,
  isDirectMessage,
  isAssistantParticipant,
  isAssistantMentioned,
}: {
  mode: AiChatAssistantMode;
  isDirectAssistantChat: boolean;
  isDirectMessage: boolean;
  isAssistantParticipant: boolean;
  isAssistantMentioned: boolean;
}): AgentChatReplyDecision => {
  if (isDirectAssistantChat) {
    return 'REPLY';
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
    isDirectAssistantChat,
    isDirectMessage,
    isAssistantParticipant,
    isAssistantMentioned,
  });

  return isAssistantParticipating ? 'EVALUATE' : 'SKIP';
};
