import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

export type AgentChatPreparedMemberMessage = {
  id?: string;
  text: string;
  parts: ExtendedUIMessagePart[];
};
