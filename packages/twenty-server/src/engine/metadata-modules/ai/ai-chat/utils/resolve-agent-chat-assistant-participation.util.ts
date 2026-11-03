import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { type AgentChatAudience } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-audience.type';

export const resolveAgentChatAssistantParticipation = ({
  mode,
  audience,
  isAssistantParticipant,
  isAssistantMentioned,
  isInitialAssistantParticipant,
  isInitialMessage = false,
}: {
  mode: AiChatAssistantMode;
  audience: AgentChatAudience;
  isAssistantParticipant: boolean;
  isAssistantMentioned: boolean;
  isInitialAssistantParticipant?: boolean;
  isInitialMessage?: boolean;
}): boolean => {
  if (audience === 'assistant-chat') {
    return true;
  }

  if (mode === AiChatAssistantMode.NEVER) {
    return false;
  }

  if (audience === 'direct-message' && mode === AiChatAssistantMode.AUTOMATIC) {
    return true;
  }

  if (audience === 'direct-message' && isInitialMessage) {
    return isAssistantMentioned;
  }

  const selectedParticipation = isInitialMessage
    ? (isInitialAssistantParticipant ?? isAssistantParticipant)
    : isAssistantParticipant;

  return selectedParticipation || isAssistantMentioned;
};
