'use client';

import { type RefObject, useCallback } from 'react';

import { useScheduledOnScroll } from '@/lib/scroll';
import { applyThreeCardsScrollLayout } from '@/sections/ThreeCards/utils/three-cards-scroll-layout';
import type { ThreeCardsScrollLayoutOptions } from '@/sections/ThreeCards/utils/three-cards-scroll-layout-options';

type ThreeCardsScrollLayoutEffectProps = {
  cardCount: number;
  cardRefs: RefObject<(HTMLDivElement | null)[]>;
  gridRef: RefObject<HTMLDivElement | null>;
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
