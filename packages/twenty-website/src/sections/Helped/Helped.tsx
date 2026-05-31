import type { Scheme } from '@/theme';
import { styled } from '@linaria/react';

import { Scene } from './components/HelpedScene';
import type { HeadingCardType } from './types/heading-card-type';

export type { HeadingCardType } from './types/heading-card-type';
export type { HelpedVisualId } from './types/helped-visual-id';

const StyledSection = styled.section`
  width: 100%;

  &[data-scheme='light'] {
    background-color: var(--color-white);
  }

  &[data-scheme='muted'] {
    background-color: var(--color-neutral);
  }

  &[data-scheme='dark'] {
    background-color: var(--color-black);
  }
`;

type HelpedProps = {
  cards: HeadingCardType[];
  scheme: Scheme;
};

export function Helped({ cards, scheme }: HelpedProps) {
  return (
    <StyledSection data-scheme={scheme}>
      <Scene cards={cards} />
    </StyledSection>
  );
}
