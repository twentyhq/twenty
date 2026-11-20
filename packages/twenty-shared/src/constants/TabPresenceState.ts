export const TAB_PRESENCE_STATE = {
  FOCUSED: 'FOCUSED',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const;

export type TabPresenceState =
  (typeof TAB_PRESENCE_STATE)[keyof typeof TAB_PRESENCE_STATE];
