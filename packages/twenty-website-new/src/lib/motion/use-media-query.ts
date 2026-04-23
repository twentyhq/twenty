'use client';

import { useSyncExternalStore } from 'react';

/**
 * Subscribe to a CSS media query and re-render the caller when its match
 * state changes. Backed by `useSyncExternalStore` so it is concurrent-safe
 * and consistent across React 19's transitions.
 *
 * SSR: the hook returns `false` on the server (the layout-shift-safe
 * default — assume "doesn't match" until the client confirms). If you need
 * a different SSR fallback, pass `serverFallback`.
 *
 * The query string is part of the cache key — passing a literal string
 * avoids a new subscriber per render. If you must build the string at
 * runtime, hoist it to module scope or memoise it.
 *
 * Example:
 *   const isMdUp = useMediaQuery(`(min-width: ${theme.breakpoints.md}px)`);
 *   const reduce = useMediaQuery('(prefers-reduced-motion: reduce)');
 */
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
