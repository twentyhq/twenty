'use client';

import { type RefObject, useCallback, useEffect, useState } from 'react';

import { useScrollProgress } from '@/lib/scroll/use-scroll-progress';
import { breakpoints } from '@/theme/breakpoints';

import { mapScrollToColorMix, mapScrollToPanelMix } from './hero-scroll-colors';

export type HeroScrollState = {
  colorMix: number;
  isScrollDriven: boolean;
  panelMix: number;
  phase: 0 | 1;
  progress: number;
};

const INITIAL_SCROLL_STATE: HeroScrollState = {
  colorMix: 0,
  isScrollDriven: false,
  panelMix: 0,
  phase: 0,
  progress: 0,
};

export function useHeroScrollProgress(
  trackRef: RefObject<HTMLDivElement | null>,
): HeroScrollState {
  const [scrollState, setScrollState] =
    useState<HeroScrollState>(INITIAL_SCROLL_STATE);
  const [isScrollDriven, setIsScrollDriven] = useState(false);

  useEffect(() => {
    const updateScrollMode = () => {
      setIsScrollDriven(window.innerWidth >= breakpoints.md);
    };

    updateScrollMode();
    window.addEventListener('resize', updateScrollMode);

    return () => window.removeEventListener('resize', updateScrollMode);
  }, []);

  useEffect(() => {
    if (!isScrollDriven) {
      setScrollState(INITIAL_SCROLL_STATE);
    }
  }, [isScrollDriven]);

  const handleScrollProgress = useCallback((progress: number) => {
    const colorMix = mapScrollToColorMix(progress);
    const panelMix = mapScrollToPanelMix(progress);

    setScrollState({
      colorMix,
      isScrollDriven: true,
      panelMix,
      phase: panelMix >= 0.5 ? 1 : 0,
      progress,
    });
  }, []);

  useScrollProgress(trackRef, handleScrollProgress, {
    enabled: isScrollDriven,
  });

  return {
    ...scrollState,
    isScrollDriven,
  };
}
