// A string, not a Date: keeps Postgres microseconds so pages never skip or repeat a chat
export type AgentChatChannelThreadCursor = {
  sortAt: string | null;
  id: string;
};
