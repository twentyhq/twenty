'use client';

import { useEffect } from 'react';

import { createAnimationFrameLoop } from '@/lib/animation';

type UseScheduledOnScrollOptions = {
  enabled?: boolean;
  fireImmediately?: boolean;
};

export function useScheduledOnScroll(
  callback: () => void,
  options: UseScheduledOnScrollOptions = {},
): void {
  const { enabled = true, fireImmediately = true } = options;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const scrollTask = createAnimationFrameLoop({
      onFrame: () => {
        callback();
        return false;
      },
    });

    const schedule = scrollTask.start;

    if (fireImmediately) {
      callback();
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      scrollTask.stop();
    };
  }, [callback, enabled, fireImmediately]);
}
