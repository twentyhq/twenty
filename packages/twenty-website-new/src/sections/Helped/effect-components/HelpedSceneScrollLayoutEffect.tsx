'use client';

import { useCallback } from 'react';

import { useScheduledOnScroll } from '@/lib/scroll';
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
  innerRef,
  sectionRef,
}: HelpedSceneScrollLayoutEffectProps) {
  const runLayout = useCallback(() => {
    applyHelpedSceneLayout({ cardRefs, innerRef, sectionRef }, cards);
  }, [cardRefs, cards, innerRef, sectionRef]);

  useScheduledOnScroll(runLayout);

  return null;
}
