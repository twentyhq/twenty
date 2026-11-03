import { SYSTEM_PAGE_KEYS, type SystemPageKey } from '../../types';

export const isSystemPageKey = (value: unknown): value is SystemPageKey =>
  SYSTEM_PAGE_KEYS.includes(value as SystemPageKey);
