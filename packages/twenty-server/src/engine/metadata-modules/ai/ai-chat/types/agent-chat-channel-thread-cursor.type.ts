// lastActivityAt keeps the microseconds Postgres stores, which a Date would
// drop, so no chat is skipped or repeated between pages
export type AgentChatChannelThreadCursor = {
  lastActivityAt: string | null;
  id: string;
};
