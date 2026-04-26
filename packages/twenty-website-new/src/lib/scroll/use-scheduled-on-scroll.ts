'use client';

import { useEffect } from 'react';

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

    let rafId: number | null = null;

    const flush = () => {
      rafId = null;
      callback();
    };

    const schedule = () => {
      if (rafId !== null) {
        return;
      }
      rafId = window.requestAnimationFrame(flush);
    };

    if (fireImmediately) {
      callback();
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [callback, enabled, fireImmediately]);
}
