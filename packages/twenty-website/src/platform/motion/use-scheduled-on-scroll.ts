'use client';

import { useEffect } from 'react';

import { createAnimationFrameLoop } from './animation-frame-loop';

export function useScheduledOnScroll(
  callback: () => void,
  options: { enabled?: boolean } = {},
): void {
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const frameTask = createAnimationFrameLoop({
      onFrame: () => {
        callback();
        return false;
      },
    });
    const schedule = frameTask.start;

    callback();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      frameTask.stop();
    };
  }, [callback, enabled]);
}
