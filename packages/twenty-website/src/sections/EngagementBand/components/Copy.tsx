import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledCopy = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  max-width: 100%;
  min-width: 0;
  position: relative;
  row-gap: ${theme.spacing(2)};
  z-index: 1;
`;

type CopyProps = {
  children: ReactNode;
};

export function Copy({ children }: CopyProps) {
  return <StyledCopy>{children}</StyledCopy>;
}
