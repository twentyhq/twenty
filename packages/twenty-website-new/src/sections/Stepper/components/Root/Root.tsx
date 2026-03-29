import { Container } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledSection = styled.section`
  background-color: ${theme.colors.primary.text[5]};
  width: 100%;
`;

const Grid = styled(Container)`
  display: grid;
  grid-template-columns: 1fr;
  min-width: 0;
  padding-bottom: ${theme.spacing(12)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(12)};
  row-gap: ${theme.spacing(10)};
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: start;
    column-gap: ${theme.spacing(10)};
    grid-template-columns: minmax(0, 1fr) minmax(0, 672px);
    padding-bottom: ${theme.spacing(20)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(20)};
    row-gap: ${theme.spacing(12)};
  }
`;

type RootProps = { children: ReactNode };

export function Root({ children }: RootProps) {
  return (
    <StyledSection>
      <Grid>{children}</Grid>
    </StyledSection>
  );
}
