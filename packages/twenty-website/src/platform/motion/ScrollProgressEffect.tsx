'use client';

import { type RefObject } from 'react';

import { useScrollProgress } from './use-scroll-progress';

export type ScrollProgressEffectProps = {
  enabled?: boolean;
  onScrollProgress: (progress: number) => void;
  scrollContainerRef: RefObject<HTMLElement | null>;
};

export function ScrollProgressEffect({
  enabled = true,
  onScrollProgress,
  scrollContainerRef,
}: ScrollProgressEffectProps): null {
  useScrollProgress(scrollContainerRef, onScrollProgress, { enabled });
  return null;
}
