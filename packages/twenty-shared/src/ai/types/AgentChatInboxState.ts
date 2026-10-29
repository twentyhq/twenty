export type AgentChatInboxState = {
  lastReadAt: string | null;
  archivedAt: string | null;
  snoozedUntil: string | null;
  isSubscribed: boolean;
  lastMentionedAt: string | null;
  lastResolvedMentionAt: string | null;
};
