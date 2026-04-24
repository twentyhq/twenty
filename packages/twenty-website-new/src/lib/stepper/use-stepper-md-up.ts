'use client';

import { useMediaQuery } from '@/lib/motion';
import { theme } from '@/theme';

const MD_UP_QUERY = `(min-width: ${theme.breakpoints.md}px)`;

export function useStepperMdUp(): boolean {
  return useMediaQuery(MD_UP_QUERY);
}

export function getStepperMdUpSnapshot(): boolean {
  return window.matchMedia(MD_UP_QUERY).matches;
}
