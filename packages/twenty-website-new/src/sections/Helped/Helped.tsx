import type { Scheme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';
export type { HeadingCardType } from './types/heading-card-type';
export type { HelpedVisualId } from './types/helped-visual-id';
import { Scene } from './components/HelpedScene';

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

type RootProps = {
  backgroundColor?: string;
  children: ReactNode;
  scheme?: Scheme;
};

function Root({ backgroundColor, children, scheme }: RootProps) {
  return (
    <StyledSection
      data-scheme={scheme}
      style={scheme ? undefined : { backgroundColor }}
    >
      {children}
    </StyledSection>
  );
}

export const Helped = { Root, Scene };
