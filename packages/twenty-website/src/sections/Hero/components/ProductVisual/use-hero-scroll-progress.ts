'use client';

import { type RefObject, useCallback, useEffect, useState } from 'react';

const NAV_HEIGHT = 64;

// Scroll range over which the morph happens (as fraction of scrollable distance)
const MORPH_START = 0.12;
const MORPH_END = 0.55;

const NAV_EXIT_DISTANCE_PX = 120;

function smoothstep(value: number): number {
  return value * value * (3 - 2 * value);
}

function mapToMorphProgress(scrollProgress: number): number {
  if (scrollProgress <= MORPH_START) return 0;
  if (scrollProgress >= MORPH_END) return 1;

  const linear = (scrollProgress - MORPH_START) / (MORPH_END - MORPH_START);

  return smoothstep(linear);
}

export type HeroScrollState = {
  morphProgress: number;
  navProgress: number;
  phase: 0 | 1;
};

const INITIAL_STATE: HeroScrollState = {
  morphProgress: 0,
  navProgress: 0,
  phase: 0,
};

export function useHeroScrollProgress(
  trackRef: RefObject<HTMLDivElement | null>,
): HeroScrollState {
  const [state, setState] = useState<HeroScrollState>(INITIAL_STATE);

  const handleScroll = useCallback(() => {
    const element = trackRef.current;

    if (!element) return;

    const rect = element.getBoundingClientRect();
    const scrollableDistance = element.offsetHeight - window.innerHeight;

    if (scrollableDistance <= 0) return;

    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));
    const morphProgress = mapToMorphProgress(progress);

    let navProgress = 0;

    const wipeLineY = window.innerHeight * (1 - morphProgress);
    const NAV_TRANSITION_WINDOW = window.innerHeight * 0.4;

    if (wipeLineY <= NAV_HEIGHT) {
      navProgress = 1;
    } else if (wipeLineY <= NAV_HEIGHT + NAV_TRANSITION_WINDOW) {
      const linear = 1 - (wipeLineY - NAV_HEIGHT) / NAV_TRANSITION_WINDOW;
      navProgress = smoothstep(linear);
    }

    const trackBottom = rect.bottom;

    if (trackBottom < NAV_HEIGHT) {
      navProgress = 0;
    } else if (trackBottom < NAV_HEIGHT + NAV_EXIT_DISTANCE_PX) {
      const exitFade = (trackBottom - NAV_HEIGHT) / NAV_EXIT_DISTANCE_PX;
      navProgress = navProgress * exitFade;
    }

    setState({
      morphProgress,
      navProgress,
      phase: morphProgress >= 0.5 ? 1 : 0,
    });
  }, [trackRef]);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  return state;
}
