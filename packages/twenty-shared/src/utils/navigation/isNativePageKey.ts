import { NATIVE_PAGE_KEYS, type NativePageKey } from '../../types';

export const isNativePageKey = (value: unknown): value is NativePageKey =>
  NATIVE_PAGE_KEYS.some((nativePageKey) => nativePageKey === value);
