'use client';

import { useCallback, useRef } from 'react';

import { useScheduledOnScroll } from '@/lib/scroll';
import type { HeadingCardType } from '@/sections/Helped/types/HeadingCard';
import {
  applyHelpedSceneLayout,
  createHelpedSceneLayoutState,
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
  const layoutStateRef = useRef(createHelpedSceneLayoutState());
  const runLayout = useCallback(() => {
    applyHelpedSceneLayout(
      { cardRefs, innerRef, sectionRef },
      cards,
      layoutStateRef.current,
    );
  }, [cardRefs, cards, innerRef, sectionRef]);

  useScheduledOnScroll(runLayout);

  return null;
}
