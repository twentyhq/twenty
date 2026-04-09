'use client';

import { ThreeCardsScrollLayoutEffect } from '@/sections/ThreeCards/effect-components/ThreeCardsScrollLayoutEffect';
import { ThreeCardsIllustrationCardType } from '@/sections/ThreeCards/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useRef } from 'react';
import { IllustrationCard } from '../IllustrationCard/IllustrationCard';

const SCROLL_HEIGHT_VH = 125;

const ScrollStage = styled.div`
  position: relative;
  width: 100%;
`;

const StickyGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing(4)};
  position: sticky;
  top: 10vh;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    grid-template-columns: none;
  }
`;

const CardSlot = styled.div`
  will-change: transform, opacity;

  @media (max-width: ${theme.breakpoints.md - 1}px) {
    opacity: 1 !important;
    transform: none !important;
  }
`;

type IllustrationCardsProps = {
  illustrationCards: ThreeCardsIllustrationCardType[];
  variant?: 'shaped' | 'simple';
};

export function IllustrationCards({
  illustrationCards,
  variant = 'shaped',
}: IllustrationCardsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardCount = illustrationCards.length;

  return (
    <ScrollStage ref={sectionRef} style={{ height: `${SCROLL_HEIGHT_VH}vh` }}>
      <ThreeCardsScrollLayoutEffect
        cardCount={cardCount}
        cardRefs={cardRefs}
        sectionRef={sectionRef}
      />
      <StickyGrid>
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
      </StickyGrid>
    </ScrollStage>
  );
}
