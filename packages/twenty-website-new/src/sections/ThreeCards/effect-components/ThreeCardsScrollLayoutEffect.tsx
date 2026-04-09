'use client';

import { useEffect } from 'react';

import {
  applyThreeCardsScrollLayout,
  type ThreeCardsScrollLayoutRefs,
} from '@/sections/ThreeCards/utils/three-cards-scroll-layout';

type ThreeCardsScrollLayoutEffectProps = ThreeCardsScrollLayoutRefs & {
  cardCount: number;
};

export function ThreeCardsScrollLayoutEffect({
  cardCount,
  cardRefs,
  sectionRef,
}: ThreeCardsScrollLayoutEffectProps) {
  useEffect(() => {
    const refs: ThreeCardsScrollLayoutRefs = { cardRefs, sectionRef };

    let rafId: number | null = null;

    const flushLayout = () => {
      rafId = null;
      applyThreeCardsScrollLayout(refs, cardCount);
    };

    const scheduleLayout = () => {
      if (rafId !== null) {
        return;
      }
      rafId = window.requestAnimationFrame(flushLayout);
    };

    applyThreeCardsScrollLayout(refs, cardCount);
    window.addEventListener('scroll', scheduleLayout, { passive: true });
    window.addEventListener('resize', scheduleLayout);
    return () => {
      window.removeEventListener('scroll', scheduleLayout);
      window.removeEventListener('resize', scheduleLayout);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [cardCount, cardRefs, sectionRef]);

  return null;
}
