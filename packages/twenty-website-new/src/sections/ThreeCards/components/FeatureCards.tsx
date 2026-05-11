'use client';

import { ThreeCardsScrollLayoutEffect } from '@/sections/ThreeCards/effect-components/ThreeCardsScrollLayoutEffect';
import type { ThreeCardsFeatureCardType } from '@/sections/ThreeCards/types';
import type { ThreeCardsScrollLayoutOptions } from '@/sections/ThreeCards/utils/three-cards-scroll-layout-options';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useRef } from 'react';
import { FeatureCard } from './FeatureCard/FeatureCard';

const FeatureCardsGrid = styled.div`
  display: grid;
  /*
   * minmax(0, 1fr) (instead of plain 1fr) forces every column to the same
   * width regardless of any single card's min-content. Without the 0 floor
   * a longer word in one card's heading/body lets that grid track expand,
   * which then shrinks the other columns and — because CardImage now uses
   * aspect-ratio — gives the three cards mismatched visual heights.
   */
  grid-template-columns: minmax(0, 1fr);
  gap: ${theme.spacing(4)};

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
    grid-template-columns: none;
  }
`;

const CardSlot = styled.div`
  will-change: transform, opacity;
`;

const FEATURE_CARDS_SCROLL_LAYOUT_OPTIONS: ThreeCardsScrollLayoutOptions = {
  stagger: 0.12,
  endEdgeRatio: 0.3,
  initialTranslateY: 120,
  initialScale: 0.94,
  opacityRamp: 0.25,
};

type FeatureCardsProps = { featureCards: ThreeCardsFeatureCardType[] };

export function FeatureCards({ featureCards }: FeatureCardsProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <FeatureCardsGrid ref={gridRef}>
      <ThreeCardsScrollLayoutEffect
        cardCount={featureCards.length}
        cardRefs={cardRefs}
        gridRef={gridRef}
        layoutOptions={FEATURE_CARDS_SCROLL_LAYOUT_OPTIONS}
      />
      {featureCards.map((featureCard, index) => (
        <CardSlot
          key={index}
          ref={(element) => {
            cardRefs.current[index] = element;
          }}
        >
          <FeatureCard featureCard={featureCard} />
        </CardSlot>
      ))}
    </FeatureCardsGrid>
  );
}
