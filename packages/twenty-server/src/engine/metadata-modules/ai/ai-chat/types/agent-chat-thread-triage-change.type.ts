export type AgentChatThreadTriageChange =
  | { type: 'DONE' }
  | { type: 'SNOOZE'; snoozedUntil: Date }
  | { type: 'REOPEN' };
