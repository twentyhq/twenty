export type ConversationMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant' };
