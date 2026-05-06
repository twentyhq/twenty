'use client';

import { useEffect, type RefObject } from 'react';

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
