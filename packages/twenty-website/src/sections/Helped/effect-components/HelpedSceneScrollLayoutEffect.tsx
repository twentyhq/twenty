'use client';

import { useCallback, useRef } from 'react';

import { useScheduledOnScroll } from '@/lib/scroll';
import { applyHelpedSceneLayout } from '../utils/apply-helped-scene-layout';
import { createHelpedSceneLayoutState } from '../utils/create-helped-scene-layout-state';
import type { HeadingCardType } from '../types/heading-card-type';
import type { HelpedSceneLayoutRefs } from '../types/helped-scene-layout-refs';

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
