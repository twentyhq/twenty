import { Container } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledSection = styled.section`
  width: 100%;
`;

const Grid = styled(Container)`
  display: grid;
  gap: ${theme.spacing(10)};
  grid-template-columns: 1fr;
  min-width: 0;
  padding-bottom: ${theme.spacing(12)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(12)};
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: start;
    column-gap: ${theme.spacing(10)};
    grid-template-columns: minmax(0, 400px) minmax(0, 672px);
    justify-content: space-between;
    padding-bottom: ${theme.spacing(20)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(20)};
  }
`;

type RootProps = {
  backgroundColor: string;
  children: ReactNode;
};

export function Root({ backgroundColor, children }: RootProps) {
  return (
    <StyledSection style={{ backgroundColor }}>
      <Grid>{children}</Grid>
    </StyledSection>
  );
}
