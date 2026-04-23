'use client';

import { useEffect, type RefObject } from 'react';

import { computeScrollProgress } from './compute-scroll-progress';

type UseScrollProgressOptions = {
  /**
   * When `false`, the hook does not subscribe to scroll/resize and
   * `onProgress` is not called. Use this for screen-size-gated stepper
   * effects that only need scroll progress on desktop.
   *
   * Default: `true`.
   */
  enabled?: boolean;
};

/**
 * Subscribes to `scroll` and `resize` and emits the container's scroll
 * progress (0..1) to `onProgress` whenever it changes. See
 * `computeScrollProgress` for the semantics of "progress".
 *
 * `onProgress` is called once on mount with the initial progress so the
 * consumer's UI can render the correct frame on the first paint.
 *
 * The hook does not throttle. The site already pays the cost of running
 * `getBoundingClientRect` on every scroll event and consumers depend on
 * sub-frame freshness for their layout math. If you want rAF batching for
 * a heavier callback, wrap it with `useScheduledOnScroll` instead.
 */
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

    const handleScroll = () => {
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

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [enabled, onProgress, scrollContainerRef]);
}
