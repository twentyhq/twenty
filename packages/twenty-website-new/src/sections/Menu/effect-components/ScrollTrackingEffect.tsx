'use client';

import { useTimeoutRegistry } from '@/lib/react';
import { useEffect } from 'react';

const SCROLL_IDLE_TIMEOUT_MS = 150;

type ScrollTrackingEffectProps = {
  onScrollStateChange: (hasScrolled: boolean, isScrolling: boolean) => void;
};

export function ScrollTrackingEffect({
  onScrollStateChange,
}: ScrollTrackingEffectProps) {
  const timeoutRegistry = useTimeoutRegistry();

  useEffect(() => {
    let cancelScrollIdle: (() => void) | null = null;

    const handleScroll = () => {
      onScrollStateChange(window.scrollY > 8, true);

      cancelScrollIdle?.();

      cancelScrollIdle = timeoutRegistry.schedule(() => {
        onScrollStateChange(window.scrollY > 8, false);
        cancelScrollIdle = null;
      }, SCROLL_IDLE_TIMEOUT_MS);
    };

    onScrollStateChange(window.scrollY > 8, false);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelScrollIdle?.();
    };
  }, [onScrollStateChange, timeoutRegistry]);

  return null;
}
