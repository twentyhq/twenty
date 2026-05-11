'use client';

import { type RefObject } from 'react';

import { useScrollProgress } from './use-scroll-progress';

type ScrollProgressEffectProps = {
  scrollContainerRef: RefObject<HTMLElement | null>;
  onScrollProgress: (progress: number) => void;
  enabled?: boolean;
};

export function ScrollProgressEffect({
  scrollContainerRef,
  onScrollProgress,
  enabled = true,
}: ScrollProgressEffectProps): null {
  useScrollProgress(scrollContainerRef, onScrollProgress, { enabled });
  return null;
}
