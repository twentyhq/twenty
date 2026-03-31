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

    const run = () => {
      applyHelpedSceneLayout(refs, cards);
    };

    run();
    window.addEventListener('scroll', run, { passive: true });
    window.addEventListener('resize', run);
    return () => {
      window.removeEventListener('scroll', run);
      window.removeEventListener('resize', run);
    };
  }, [cardRefs, cards, headlineRef, innerRef, sectionRef]);

  return null;
}
