'use client';

import { useMediaQuery } from '@/lib/motion';
import { theme } from '@/theme';

const MD_UP_QUERY = `(min-width: ${theme.breakpoints.md}px)`;

/**
 * `true` once the viewport is at the `md` breakpoint or wider. Stepper
 * sections use this to switch between scroll-driven (desktop) and
 * swipe-driven (mobile) layouts.
 *
 * Backed by the shared `useMediaQuery` primitive in `lib/motion/`.
 */
export function useStepperMdUp(): boolean {
  return useMediaQuery(MD_UP_QUERY);
}

/**
 * Snapshot equivalent of `useStepperMdUp`. Reads `matchMedia` once without
 * subscribing. Use from non-component code (layout utilities called inside
 * `useEffect`) where re-running the math on resize is already handled by a
 * surrounding `useScheduledOnScroll` and a reactive subscription would
 * just duplicate the work.
 */
export function getStepperMdUpSnapshot(): boolean {
  return window.matchMedia(MD_UP_QUERY).matches;
}
