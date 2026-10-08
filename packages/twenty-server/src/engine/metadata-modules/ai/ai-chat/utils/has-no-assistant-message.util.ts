import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const hasNoAssistantMessage = (
  messages: Pick<ExtendedUIMessage, 'role'>[],
): boolean => messages.every((message) => message.role !== 'assistant');
