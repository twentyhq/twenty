'use client';

import { useEffect } from 'react';

import type { HeadingCardType } from '@/sections/Helped/types/HeadingCard';
import {
  applyHelpedSceneLayout,
  type HelpedSceneLayoutRefs,
} from '@/sections/Helped/utils/helped-scene-layout';

type HelpedSceneScrollLayoutEffectProps = HelpedSceneLayoutRefs & {
  cards: HeadingCardType[];
};

export function HelpedSceneScrollLayoutEffect({
  cardRefs,
  cards,
  headlineRef,
  innerRef,
  sectionRef,
}: HelpedSceneScrollLayoutEffectProps) {
  useEffect(() => {
    const refs: HelpedSceneLayoutRefs = {
      cardRefs,
      headlineRef,
      innerRef,
      sectionRef,
    };

    let rafId: number | null = null;

    const flushLayout = () => {
      rafId = null;
      applyHelpedSceneLayout(refs, cards);
    };

    const scheduleLayout = () => {
      if (rafId !== null) {
        return;
      }
      rafId = window.requestAnimationFrame(flushLayout);
    };

    applyHelpedSceneLayout(refs, cards);
    window.addEventListener('scroll', scheduleLayout, { passive: true });
    window.addEventListener('resize', scheduleLayout);
    return () => {
      window.removeEventListener('scroll', scheduleLayout);
      window.removeEventListener('resize', scheduleLayout);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [cardRefs, cards, headlineRef, innerRef, sectionRef]);

  return null;
}
