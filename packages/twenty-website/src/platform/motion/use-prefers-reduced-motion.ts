'use client';

import { useMediaQuery } from './use-media-query';

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
