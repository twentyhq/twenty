import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledRightColumn = styled.div`
  min-width: 0;
  width: 100%;

  @media (max-width: ${theme.breakpoints.md - 1}px) {
    order: -1;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    align-self: start;
    max-width: 672px;
    position: sticky;
    top: calc(4.5rem + (100vh - 4.5rem) * 0.5 - 368px);
  }
`;

type RightColumnProps = {
  children: ReactNode;
};

export function RightColumn({ children }: RightColumnProps) {
  return <StyledRightColumn>{children}</StyledRightColumn>;
}
