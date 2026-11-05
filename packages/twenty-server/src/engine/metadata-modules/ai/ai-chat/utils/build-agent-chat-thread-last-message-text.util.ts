import { isNonEmptyString } from '@sniptt/guards';

import { AGENT_CHAT_THREAD_LAST_MESSAGE_TEXT_MAX_LENGTH } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-last-message-text-max-length.constant';

export const buildAgentChatThreadLastMessageText = (
  text: string,
): string | null => {
  const trimmedText = text.trim();

  if (!isNonEmptyString(trimmedText)) {
    return null;
  }

  return Array.from(trimmedText)
    .slice(0, AGENT_CHAT_THREAD_LAST_MESSAGE_TEXT_MAX_LENGTH)
    .join('');
};
