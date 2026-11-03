import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { AgentChatAudience } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-audience.enum';

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
  if (audience === AgentChatAudience.ASSISTANT_CHAT) {
    return true;
  }

  if (mode === AiChatAssistantMode.NEVER) {
    return false;
  }

  if (
    audience === AgentChatAudience.DIRECT_MESSAGE &&
    mode === AiChatAssistantMode.AUTOMATIC
  ) {
    return true;
  }

  if (audience === AgentChatAudience.DIRECT_MESSAGE && isInitialMessage) {
    return isAssistantMentioned;
  }

  const selectedParticipation = isInitialMessage
    ? (isInitialAssistantParticipant ?? isAssistantParticipant)
    : isAssistantParticipant;

  return selectedParticipation || isAssistantMentioned;
};
