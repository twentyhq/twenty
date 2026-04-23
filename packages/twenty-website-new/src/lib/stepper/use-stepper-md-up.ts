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
