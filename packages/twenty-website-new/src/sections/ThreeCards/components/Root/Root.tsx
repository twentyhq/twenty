import { Container } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledSection = styled.section`
  width: 100%;
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

type RootProps = { backgroundColor: string; children: ReactNode };

export function Root({ backgroundColor, children }: RootProps) {
  return (
    <StyledSection style={{ backgroundColor }}>
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}
