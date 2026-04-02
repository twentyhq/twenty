import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const BottomGrid = styled.div`
  display: grid;
  font-size: ${theme.font.size(3)};
  gap: ${theme.spacing(6)};
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: auto auto;
  min-width: 0;
  width: 100%;
`;

const Copyright = styled.div`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.mono};
  grid-column: 1;
  grid-row: 2;
  justify-self: start;
  text-transform: uppercase;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-row: 1;
  }
`;

const Credit = styled.div`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.mono};
  grid-column: 2;
  grid-row: 2;
  justify-self: end;
  text-transform: uppercase;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-column: 1 / -1;
  }
`;

type BottomProps = {
  children?: ReactNode;
  copyright: string;
  credit: string;
};

export function Bottom({ children, copyright, credit }: BottomProps) {
  return (
    <BottomGrid>
      <Copyright>{copyright}</Copyright>
      {children}
      <Credit>{credit}</Credit>
    </BottomGrid>
  );
}
