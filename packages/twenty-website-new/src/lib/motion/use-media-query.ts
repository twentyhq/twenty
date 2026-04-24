'use client';

import { useSyncExternalStore } from 'react';

export function useMediaQuery(
  query: string,
  options: { serverFallback?: boolean } = {},
): boolean {
  const { serverFallback = false } = options;

  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => getSnapshot(query),
    () => serverFallback,
  );
}

function subscribe(query: string, callback: () => void): () => void {
  const mediaQueryList = window.matchMedia(query);
  mediaQueryList.addEventListener('change', callback);
  return () => {
    mediaQueryList.removeEventListener('change', callback);
  };
}

function getSnapshot(query: string): boolean {
  return window.matchMedia(query).matches;
}
