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
    align-items: center;
    align-self: start;
    display: flex;
    height: calc(100vh - 4.5rem);
    justify-content: center;
    position: sticky;
    top: 4.5rem;
  }
`;

const VisualFrame = styled.div`
  min-width: 0;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 672px;
  }
`;

type RightColumnProps = {
  children: ReactNode;
};

export function RightColumn({ children }: RightColumnProps) {
  return (
    <StyledRightColumn>
      <VisualFrame>{children}</VisualFrame>
    </StyledRightColumn>
  );
}
