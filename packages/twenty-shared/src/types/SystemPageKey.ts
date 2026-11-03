export const SYSTEM_PAGE_KEYS = ['workflows', 'agents', 'dataModel'] as const;

export type SystemPageKey = (typeof SYSTEM_PAGE_KEYS)[number];
