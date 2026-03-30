import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledCta = styled.div`
  column-gap: ${theme.spacing(2)};
  display: grid;
  grid-template-columns: auto auto;
  justify-content: start;
`;

type CtaProps = {
  children: ReactNode;
};

export function Cta({ children }: CtaProps) {
  return <StyledCta>{children}</StyledCta>;
}
