'use client';

import { useEffect } from 'react';

import { createAnimationFrameLoop } from './animation-frame-loop';

// Runs the callback on scroll/resize, batched to one call per animation
// frame regardless of event rate.
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
