import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledRightColumn = styled.div`
  min-width: 0;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 672px;
    position: sticky;
    top: ${theme.spacing(10)};
  }
`;

type RightColumnProps = {
  children: ReactNode;
};

export function RightColumn({ children }: RightColumnProps) {
  return <StyledRightColumn>{children}</StyledRightColumn>;
}
