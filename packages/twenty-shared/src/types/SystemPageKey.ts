export const SYSTEM_PAGE_KEYS = ['workflows', 'agents'] as const;

export type SystemPageKey = (typeof SYSTEM_PAGE_KEYS)[number];
