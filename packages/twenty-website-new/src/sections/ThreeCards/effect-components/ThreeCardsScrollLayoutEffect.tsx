'use client';

import { useCallback } from 'react';

import { useScheduledOnScroll } from '@/lib/scroll';
import {
  applyThreeCardsScrollLayout,
  type ThreeCardsScrollLayoutOptions,
  type ThreeCardsScrollLayoutRefs,
} from '@/sections/ThreeCards/utils/three-cards-scroll-layout';

type ThreeCardsScrollLayoutEffectProps = ThreeCardsScrollLayoutRefs & {
  cardCount: number;
  layoutOptions?: ThreeCardsScrollLayoutOptions;
};

export function ThreeCardsScrollLayoutEffect({
  cardCount,
  cardRefs,
  gridRef,
  layoutOptions,
}: ThreeCardsScrollLayoutEffectProps) {
  const runLayout = useCallback(() => {
    applyThreeCardsScrollLayout(
      { cardRefs, gridRef },
      cardCount,
      layoutOptions,
    );
  }, [cardCount, cardRefs, gridRef, layoutOptions]);

  useScheduledOnScroll(runLayout);

  return null;
}
