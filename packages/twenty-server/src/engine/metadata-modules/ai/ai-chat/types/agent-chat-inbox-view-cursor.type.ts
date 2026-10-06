// lastActivityAt keeps the microseconds Postgres stores, which a Date would
// drop, so no chat is skipped or repeated between pages
export type AgentChatInboxViewCursor = {
  lastActivityAt: string | null;
  id: string;
};
