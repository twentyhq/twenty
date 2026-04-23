'use client';

import { useEffect } from 'react';

type UseScheduledOnScrollOptions = {
  /**
   * When `false`, the hook does not subscribe and the callback is not run.
   * Default: `true`.
   */
  enabled?: boolean;
  /**
   * When `true`, the callback runs once synchronously on mount before the
   * first scroll event. Use this to lay out the page on first paint based
   * on the initial scroll position.
   *
   * Default: `true`.
   */
  fireImmediately?: boolean;
};

/**
 * Subscribes to `scroll` and `resize` and runs `callback` at most once per
 * animation frame. Use this for scroll-driven layout work that:
 *
 *   - is more expensive than a single arithmetic update
 *     (i.e. mutates the DOM, calls `getBoundingClientRect` on many nodes,
 *     or recomputes a 3D scene), and
 *   - doesn't need sub-frame freshness — visual consistency is fine, the
 *     browser will render the latest scheduled frame.
 *
 * The hook intentionally does NOT memoise `callback` — if you pass an
 * inline closure that captures fresh state on every render, the listener
 * is re-attached. Wrap the callback in `useCallback` (or hoist it) when
 * the work is dependency-stable.
 */
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
