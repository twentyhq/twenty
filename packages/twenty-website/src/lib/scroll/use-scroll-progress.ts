'use client';

import { useEffect, type RefObject } from 'react';

import { createAnimationFrameLoop } from '@/lib/animation';
import { computeScrollProgress } from './compute-scroll-progress';

type UseScrollProgressOptions = {
  enabled?: boolean;
};

export function useScrollProgress(
  scrollContainerRef: RefObject<HTMLElement | null>,
  onProgress: (progress: number) => void,
  options: UseScrollProgressOptions = {},
): void {
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const update = () => {
      const element = scrollContainerRef.current;
      if (!element) {
        return;
      }
      const rect = element.getBoundingClientRect();
      const progress = computeScrollProgress(
        rect.top,
        rect.height,
        window.innerHeight,
      );
      if (progress === null) {
        return;
      }
      onProgress(progress);
    };

    const scrollTask = createAnimationFrameLoop({
      onFrame: () => {
        update();
        return false;
      },
    });

    const schedule = scrollTask.start;

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      scrollTask.stop();
    };
  }, [enabled, onProgress, scrollContainerRef]);
}
