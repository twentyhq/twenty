'use client';

import { useMediaQuery } from './use-media-query';

const PREFERS_REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(PREFERS_REDUCED_MOTION_QUERY);
}

export function getPrefersReducedMotionSnapshot(): boolean {
  return window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;
}
