'use client';

import { useEffect, type RefObject } from 'react';

type SyncScrollProgressFromContainerEffectProps = {
  onScrollProgress: (progress: number) => void;
  scrollContainerRef: RefObject<HTMLElement | null>;
};

export function SyncScrollProgressFromContainerEffect({
  onScrollProgress,
  scrollContainerRef,
}: SyncScrollProgressFromContainerEffectProps) {
  useEffect(() => {
    const handleScroll = () => {
      const element = scrollContainerRef.current;
      if (!element) {
        return;
      }
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollableDistance = rect.height - windowHeight;
      if (scrollableDistance <= 0) {
        return;
      }

      const progress = Math.max(0, Math.min(1, -rect.top / scrollableDistance));
      onScrollProgress(progress);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [onScrollProgress, scrollContainerRef]);

  return null;
}
