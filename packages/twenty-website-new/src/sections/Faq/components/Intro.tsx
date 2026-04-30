import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledIntro = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(6)};
`;

type IntroProps = {
  children: ReactNode;
};

export function Intro({ children }: IntroProps) {
  return <StyledIntro>{children}</StyledIntro>;
}
