'use client';

import { useEffect } from 'react';

const SCROLLED_THRESHOLD_PX = 8;
const SCROLL_IDLE_TIMEOUT_MS = 150;

export type ScrollStateEffectProps = {
  onScrollStateChange: (hasScrolled: boolean, isScrolling: boolean) => void;
};

export function ScrollStateEffect({
  onScrollStateChange,
}: ScrollStateEffectProps) {
  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      onScrollStateChange(window.scrollY > SCROLLED_THRESHOLD_PX, true);

      if (idleTimer !== null) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        onScrollStateChange(window.scrollY > SCROLLED_THRESHOLD_PX, false);
        idleTimer = null;
      }, SCROLL_IDLE_TIMEOUT_MS);
    };

    onScrollStateChange(window.scrollY > SCROLLED_THRESHOLD_PX, false);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (idleTimer !== null) clearTimeout(idleTimer);
    };
  }, [onScrollStateChange]);

  return null;
}
