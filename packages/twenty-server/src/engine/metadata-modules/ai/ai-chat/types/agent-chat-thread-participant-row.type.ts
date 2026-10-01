export type AgentChatThreadParticipantRow = {
  threadId: string;
  lastReadAt: Date | null;
  archivedAt: Date | null;
  snoozedUntil: Date | null;
};
