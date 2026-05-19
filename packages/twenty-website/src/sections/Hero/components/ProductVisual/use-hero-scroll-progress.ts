import { type RefObject, useEffect, useState } from 'react';

const TRANSITION_POINT = 0.25;
const MOBILE_BREAKPOINT = 921;

export function useHeroScrollProgress(
  trackRef: RefObject<HTMLDivElement | null>,
): number {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const element = trackRef.current;
    if (!element) return;

    if (window.innerWidth < MOBILE_BREAKPOINT) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const scrollableDistance = element.offsetHeight - window.innerHeight;

      if (scrollableDistance <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));

      setPhase(progress >= TRANSITION_POINT ? 1 : 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackRef]);

  return phase;
}
