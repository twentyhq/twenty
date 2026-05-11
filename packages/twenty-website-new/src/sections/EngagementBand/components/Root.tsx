import { Container } from '@/design-system/components';
import { theme, type Scheme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledSection = styled.section<{ compactBottom: boolean }>`
  padding-bottom: ${({ compactBottom }) =>
    compactBottom ? theme.spacing(6) : theme.spacing(20)};
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
  min-width: 0;
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(6)};
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
  }
`;

type RootProps = {
  backgroundColor?: string;
  children: ReactNode;
  compactBottom?: boolean;
  scheme?: Scheme;
};

export function Root({
  backgroundColor,
  children,
  compactBottom = false,
  scheme,
}: RootProps) {
  return (
    <StyledSection
      compactBottom={compactBottom}
      data-scheme={scheme}
      style={scheme ? undefined : { backgroundColor }}
    >
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}
