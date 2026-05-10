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

const StyledContainer = styled(Container)<{ compactTop: boolean }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing(6)};
  padding-bottom: ${theme.spacing(22)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${({ compactTop }) =>
    compactTop ? theme.spacing(6) : theme.spacing(12)};

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: ${theme.spacing(20)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${({ compactTop }) =>
      compactTop ? theme.spacing(16) : theme.spacing(20)};
    padding-bottom: ${theme.spacing(20)};
  }
`;

type RootProps = {
  backgroundColor?: string;
  children: ReactNode;
  compactTop?: boolean;
  scheme?: Scheme;
};

export function Root({
  backgroundColor,
  children,
  compactTop = false,
  scheme,
}: RootProps) {
  return (
    <StyledSection
      data-scheme={scheme}
      style={scheme ? undefined : { backgroundColor }}
    >
      <StyledContainer compactTop={compactTop}>{children}</StyledContainer>
    </StyledSection>
  );
}
