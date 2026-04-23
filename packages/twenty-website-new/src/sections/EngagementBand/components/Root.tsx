import { Container } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledSection = styled.section<{ compactBottom: boolean }>`
  padding-bottom: ${({ compactBottom }) =>
    compactBottom ? theme.spacing(6) : theme.spacing(20)};
  width: 100%;
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
  backgroundColor: string;
  children: ReactNode;
  compactBottom?: boolean;
};

export function Root({
  backgroundColor,
  children,
  compactBottom = false,
}: RootProps) {
  return (
    <StyledSection
      compactBottom={compactBottom}
      style={{ backgroundColor }}
    >
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}
