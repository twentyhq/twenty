'use client';

import { type RefObject, useLayoutEffect } from 'react';

import { EASING } from '@/tokens';

import { type PipelineCardAnimations } from '../types/pipeline-card-animations';
import { type PipelineCardElements } from '../types/pipeline-card-elements';
import { type PipelineCardId } from '../types/pipeline-card-id';
import { type PipelineCardRects } from '../types/pipeline-card-rects';
import { type PipelineLanes } from '../types/pipeline-lanes';

const CARD_DROP_MS = 300;

type CardFlipAnimationEffectProps = {
  lanes: PipelineLanes;
  cardRefs: RefObject<PipelineCardElements>;
  pendingRectsRef: RefObject<PipelineCardRects>;
  animationsRef: RefObject<PipelineCardAnimations>;
};

export function CardFlipAnimationEffect({
  lanes,
  cardRefs,
  pendingRectsRef,
  animationsRef,
}: CardFlipAnimationEffectProps) {
  useLayoutEffect(() => {
    const previousRects = pendingRectsRef.current;
    const cardIds = Object.keys(previousRects) as PipelineCardId[];

    if (cardIds.length === 0) {
      return;
    }
    pendingRectsRef.current = {};

    for (const cardId of cardIds) {
      const previousRect = previousRects[cardId];
      const element = cardRefs.current[cardId];
      const nextRect = element?.getBoundingClientRect();

      if (!previousRect || !element || !nextRect) {
        continue;
      }
      const deltaX = previousRect.left - nextRect.left;
      const deltaY = previousRect.top - nextRect.top;

      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
        continue;
      }

      animationsRef.current[cardId]?.cancel();
      animationsRef.current[cardId] = element.animate(
        [
          { transform: `translate3d(${deltaX}px, ${deltaY}px, 0)` },
          { transform: 'translate3d(0, 0, 0)' },
        ],
        { duration: CARD_DROP_MS, easing: EASING.standard },
      );
    }
  }, [lanes, animationsRef, cardRefs, pendingRectsRef]);

  return null;
}
