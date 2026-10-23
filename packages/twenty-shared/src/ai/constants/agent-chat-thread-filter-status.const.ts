export const AGENT_CHAT_THREAD_FILTER_STATUS = {
  ACTIVE: 'active',
  NEEDS_INPUT: 'needsInput',
  MENTIONS: 'mentions',
  ASSIGNED: 'assigned',
  SNOOZED: 'snoozed',
  DONE: 'done',
} as const;

export type AgentChatThreadFilterStatus =
  (typeof AGENT_CHAT_THREAD_FILTER_STATUS)[keyof typeof AGENT_CHAT_THREAD_FILTER_STATUS];
