import { Container } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledSection = styled.section`
  min-width: 0;
  width: 100%;
`;

const StyledContainer = styled(Container)`
  column-gap: ${theme.spacing(6)};
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-items: stretch;
  padding-bottom: ${theme.spacing(12)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(12)};
  row-gap: ${theme.spacing(10)};

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    column-gap: ${theme.spacing(8)};
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    justify-items: start;
    padding-bottom: ${theme.spacing(14)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(14)};
    row-gap: ${theme.spacing(8)};
  }
`;

type RootProps = {
  backgroundColor: string;
  children: ReactNode;
};

export function Root({ backgroundColor, children }: RootProps) {
  return (
    <StyledSection style={{ backgroundColor }}>
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}
