'use client';

import { styled } from '@linaria/react';
import { Children, useCallback, useRef, type ReactNode } from 'react';

import { useScheduledOnScroll } from '@/platform/motion';
import { mediaUp, spacing } from '@/tokens';

import { applyCardRevealLayout } from './card-reveal-layout';

const Grid = styled.div`
  display: grid;
  gap: ${spacing(4)};
  grid-template-columns: 1fr;
  /* Stacked cards hold near their authored width (443px shape) instead of
     stretching across tablets — same cap pattern as the problem stage. */
  margin-inline: auto;
  max-width: 480px;
  width: 100%;

  ${mediaUp('md')} {
    grid-auto-columns: 1fr;
    grid-auto-flow: column;
    grid-template-columns: none;
    max-width: none;
  }
`;

const CardSlot = styled.div`
  will-change: transform, opacity;
`;

// The shared card grid: each card rides a slot the scroll-driven reveal
// writes transform/opacity to directly — no per-frame React work.
export function CardsGrid({ children }: { children: ReactNode }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cards = Children.toArray(children);
  const cardCount = cards.length;

  const runLayout = useCallback(() => {
    applyCardRevealLayout({ cardRefs, gridRef }, cardCount);
  }, [cardCount]);

  useScheduledOnScroll(runLayout);

  const slots = cards.map((card, cardNumber) => ({ card, cardNumber }));

  return (
    <Grid ref={gridRef}>
      {slots.map(({ card, cardNumber }) => (
        <CardSlot
          key={cardNumber}
          ref={(element) => {
            cardRefs.current[cardNumber] = element;
          }}
        >
          {card}
        </CardSlot>
      ))}
    </Grid>
  );
}
