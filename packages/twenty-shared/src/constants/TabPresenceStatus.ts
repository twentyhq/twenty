export const TAB_PRESENCE_STATUS = {
  FOCUSED: 'FOCUSED',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const;

export type TabPresenceStatus =
  (typeof TAB_PRESENCE_STATUS)[keyof typeof TAB_PRESENCE_STATUS];
