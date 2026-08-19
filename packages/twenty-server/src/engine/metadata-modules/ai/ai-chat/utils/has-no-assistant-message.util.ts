import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const hasNoAssistantMessage = (messages: ExtendedUIMessage[]): boolean =>
  messages.every((message) => message.role !== 'assistant');
