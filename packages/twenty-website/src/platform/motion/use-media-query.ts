'use client';

import { useSyncExternalStore } from 'react';

const subscribe = (query: string, callback: () => void): (() => void) => {
  const mediaQueryList = window.matchMedia(query);
  mediaQueryList.addEventListener('change', callback);
  return () => mediaQueryList.removeEventListener('change', callback);
};

export function useMediaQuery(
  query: string,
  options: { serverFallback?: boolean } = {},
): boolean {
  const { serverFallback = false } = options;
  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => window.matchMedia(query).matches,
    () => serverFallback,
  );
}
