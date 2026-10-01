export type AgentChatThreadInboxScope = 'INBOX' | 'SNOOZED' | 'ARCHIVED';

export type AgentChatThreadParticipantState = {
  lastReadAt: string | null;
  archivedAt: string | null;
  snoozedUntil: string | null;
};

export type AgentChatThreadInboxState = {
  lastActivityAt: string | null;
  participant: AgentChatThreadParticipantState | null;
};
