'use client';

import { type RefObject } from 'react';

import { useScrollProgress } from './use-scroll-progress';

type ScrollProgressEffectProps = {
  scrollContainerRef: RefObject<HTMLElement | null>;
  onScrollProgress: (progress: number) => void;
  enabled?: boolean;
};

/**
 * JSX wrapper around `useScrollProgress` for sites that prefer to mount
 * the listener as a child element rather than call a hook conditionally.
 *
 * The hook itself is preferable in new code because it composes with other
 * hooks (e.g. `useMediaQuery`) without an extra render layer. This
 * component exists for the stepper Flow components that conditionally
 * mount the effect via a ternary on `isMdUp`.
 */
export function ScrollProgressEffect({
  scrollContainerRef,
  onScrollProgress,
  enabled = true,
}: ScrollProgressEffectProps): null {
  useScrollProgress(scrollContainerRef, onScrollProgress, { enabled });
  return null;
}
