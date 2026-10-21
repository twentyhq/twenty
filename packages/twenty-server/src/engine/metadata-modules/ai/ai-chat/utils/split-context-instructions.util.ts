import { type ModelMessage, type SystemModelMessage } from 'ai';

import { OPENING_PLACEHOLDER_USER_MESSAGE } from 'src/engine/metadata-modules/ai/ai-chat/constants/opening-placeholder-user-message.constant';

// Contexts open their thread, so they extend the instructions. Providers need
// a conversation that opens with a user message, and a turn the agent opens
// has none, so a placeholder stands in for it.
export const splitContextInstructions = (
  messages: ModelMessage[],
): { contexts: SystemModelMessage[]; conversation: ModelMessage[] } => {
  const contexts = messages.filter(
    (message): message is SystemModelMessage => message.role === 'system',
  );
  const conversation = messages.filter((message) => message.role !== 'system');

  return {
    contexts,
    conversation:
      conversation[0]?.role === 'user'
        ? conversation
        : [OPENING_PLACEHOLDER_USER_MESSAGE, ...conversation],
  };
};
