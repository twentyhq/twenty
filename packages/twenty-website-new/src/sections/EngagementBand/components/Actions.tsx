import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledActions = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  justify-items: start;
  min-width: 0;
  position: relative;
  z-index: 1;

  @media (min-width: ${theme.breakpoints.md}px) {
    justify-items: end;
  }
`;

type ActionsProps = {
  children: ReactNode;
};

export function Actions({ children }: ActionsProps) {
  return <StyledActions>{children}</StyledActions>;
}
