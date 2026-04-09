'use client';

import { ThreeCardsScrollLayoutEffect } from '@/sections/ThreeCards/effect-components/ThreeCardsScrollLayoutEffect';
import { ThreeCardsFeatureCardType } from '@/sections/ThreeCards/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useRef } from 'react';
import { FeatureCard } from '../FeatureCard/FeatureCard';

const FeatureCardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing(4)};

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    grid-template-columns: none;
  }
`;

const CardSlot = styled.div`
  will-change: transform, opacity;
`;

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
