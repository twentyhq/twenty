import { Container } from '@/design-system/components';
import { theme, type Scheme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

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

const StyledContainer = styled(Container)`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing(6)};
  padding-bottom: ${theme.spacing(22)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(12)};

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: ${theme.spacing(20)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(20)};
    padding-bottom: ${theme.spacing(20)};
  }
`;

type ThreeCardsSectionProps = {
  children: ReactNode;
  scheme: Scheme;
};

export function ThreeCardsSection({
  children,
  scheme,
}: ThreeCardsSectionProps) {
  return (
    <StyledSection data-scheme={scheme}>
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}
