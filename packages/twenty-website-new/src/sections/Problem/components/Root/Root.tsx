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
  row-gap: ${theme.spacing(12)};
  padding-bottom: ${theme.spacing(12)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(6)};

  @media (min-width: ${theme.breakpoints.md}px) {
    column-gap: ${theme.spacing(4)};
    grid-template-columns: 1fr 1fr;
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(6)};
    padding-bottom: ${theme.spacing(10)};
    row-gap: ${theme.spacing(20)};
  }
`;

type RootProps = { children: ReactNode };

export function Root({ children }: RootProps) {
  return (
    <StyledSection>
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}
