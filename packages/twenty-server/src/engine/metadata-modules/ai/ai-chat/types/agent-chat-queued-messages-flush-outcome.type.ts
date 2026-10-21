// BUSY: a queued message took the conversation, or something else did first;
// HELD: they wait on something besides the conversation, such as a pending question;
// HANDED_TO_RUN: a suspended run goes on with them; GONE: the conversation was deleted
export type AgentChatQueuedMessagesFlushOutcome =
  | 'BUSY'
  | 'HELD'
  | 'NOTHING_SENT'
  | 'HANDED_TO_RUN'
  | 'GONE';
