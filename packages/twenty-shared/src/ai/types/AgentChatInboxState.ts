export type AgentChatInboxState = {
  lastReadAt: string | null;
  archivedAt: string | null;
  snoozedUntil: string | null;
  isSubscribed: boolean;
};
