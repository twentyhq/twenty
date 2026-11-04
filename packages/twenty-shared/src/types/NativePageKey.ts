export const NATIVE_PAGE_KEYS = ['workflows', 'agents'] as const;

export type NativePageKey = (typeof NATIVE_PAGE_KEYS)[number];
