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
  justify-items: center;
  padding-bottom: 0;
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(12)};
  row-gap: ${theme.spacing(8)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: 0;
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(20)};
  }
`;

type RootProps = {
  backgroundColor?: string;
  children: ReactNode;
  scheme?: Scheme;
};

export function Root({ backgroundColor, children, scheme }: RootProps) {
  return (
    <StyledSection
      data-scheme={scheme}
      style={scheme ? undefined : { backgroundColor }}
    >
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}
