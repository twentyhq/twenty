'use client';

import { ThreeCardsScrollLayoutEffect } from '@/sections/ThreeCards/effect-components/ThreeCardsScrollLayoutEffect';
import { ThreeCardsIllustrationCardType } from '@/sections/ThreeCards/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useRef } from 'react';
import { IllustrationCard } from '../IllustrationCard/IllustrationCard';

const IllustrationCardsGrid = styled.div`
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

type IllustrationCardsProps = {
  illustrationCards: ThreeCardsIllustrationCardType[];
  variant?: 'shaped' | 'simple';
};

export function IllustrationCards({
  illustrationCards,
  variant = 'shaped',
}: IllustrationCardsProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <IllustrationCardsGrid ref={gridRef}>
      <ThreeCardsScrollLayoutEffect
        cardCount={illustrationCards.length}
        cardRefs={cardRefs}
        gridRef={gridRef}
      />
      {illustrationCards.map((illustrationCard, index) => (
        <CardSlot
          key={index}
          ref={(element) => {
            cardRefs.current[index] = element;
          }}
        >
          <IllustrationCard
            variant={variant}
            illustrationCard={illustrationCard}
          />
        </CardSlot>
      ))}
    </IllustrationCardsGrid>
  );
}
