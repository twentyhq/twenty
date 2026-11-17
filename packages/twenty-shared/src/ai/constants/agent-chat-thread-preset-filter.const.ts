export const AGENT_CHAT_THREAD_PRESET_FILTER = {
  OPEN: 'active',
  NEEDS_INPUT: 'needsInput',
  MENTIONS: 'mentions',
  ASSIGNED_TO_ME: 'assigned',
  ASSIGNED_TO_ANYONE: 'assignedToAnyone',
  UNASSIGNED: 'unassigned',
  SNOOZED: 'snoozed',
  DONE: 'done',
} as const;

export type AgentChatThreadPresetFilter =
  (typeof AGENT_CHAT_THREAD_PRESET_FILTER)[keyof typeof AGENT_CHAT_THREAD_PRESET_FILTER];
