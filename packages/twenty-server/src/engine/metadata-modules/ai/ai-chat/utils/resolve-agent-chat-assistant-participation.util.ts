import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';

export const resolveAgentChatAssistantParticipation = ({
  mode,
  isDirectAssistantChat,
  isDirectMessage,
  isAssistantParticipant,
  isAssistantMentioned,
  initialIsAssistantParticipant,
  isInitialMessage = false,
}: {
  mode: AiChatAssistantMode;
  isDirectAssistantChat: boolean;
  isDirectMessage: boolean;
  isAssistantParticipant: boolean;
  isAssistantMentioned: boolean;
  initialIsAssistantParticipant?: boolean;
  isInitialMessage?: boolean;
}): boolean => {
  if (isDirectAssistantChat) {
    return true;
  }

  if (mode === AiChatAssistantMode.NEVER) {
    return false;
  }

  if (isDirectMessage && mode === AiChatAssistantMode.AUTOMATIC) {
    return true;
  }

  if (isDirectMessage && isInitialMessage) {
    return isAssistantMentioned;
  }

  const selectedParticipation = isInitialMessage
    ? (initialIsAssistantParticipant ?? isAssistantParticipant)
    : isAssistantParticipant;

  return selectedParticipation || isAssistantMentioned;
};
