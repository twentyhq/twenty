'use client';

import { type RefObject, useCallback, useEffect, useState } from 'react';

const NAV_HEIGHT = 64;

const MORPH_START = 0;
const MORPH_END = 0.55;

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
  menuBackground: string;
  menuElevated: boolean;
  morphProgress: number;
  navProgress: number;
};

const INITIAL_STATE: HeroScrollState = {
  menuBackground: 'rgb(255, 255, 255)',
  menuElevated: true,
  morphProgress: 0,
  navProgress: 0,
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
    const trackBottom = rect.bottom;

    if (wipeLineY <= 0) {
      navProgress = 1;
    } else if (wipeLineY < NAV_HEIGHT) {
      navProgress = smoothstep(1 - wipeLineY / NAV_HEIGHT);
    }

    if (trackBottom <= 0) {
      navProgress = 0;
    } else if (trackBottom < NAV_HEIGHT) {
      navProgress *= smoothstep(trackBottom / NAV_HEIGHT);
    }

    const isCrossing =
      morphProgress < 1 && wipeLineY <= NAV_HEIGHT && trackBottom > NAV_HEIGHT;

    const channel = Math.round(255 + (20 - 255) * navProgress);
    const menuBackground = isCrossing
      ? 'transparent'
      : `rgb(${channel}, ${channel}, ${channel})`;

    setState({
      menuBackground,
      menuElevated: navProgress < 0.02 && !isCrossing,
      morphProgress,
      navProgress,
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
