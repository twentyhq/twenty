'use client';

import { useEffect, type RefObject } from 'react';

import { createAnimationFrameLoop } from './animation-frame-loop';
import { computeScrollProgress } from './compute-scroll-progress';

// Reports the container's scroll progress, batched to animation frames
// (one read per frame regardless of scroll event rate).
export function useScrollProgress(
  scrollContainerRef: RefObject<HTMLElement | null>,
  onProgress: (progress: number) => void,
  options: { enabled?: boolean } = {},
): void {
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const update = () => {
      const element = scrollContainerRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const progress = computeScrollProgress(
        rect.top,
        rect.height,
        window.innerHeight,
      );
      if (progress === null) return;
      onProgress(progress);
    };

    const frameTask = createAnimationFrameLoop({
      onFrame: () => {
        update();
        return false;
      },
    });
    const schedule = frameTask.start;

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      frameTask.stop();
    };
  }, [enabled, onProgress, scrollContainerRef]);
}
