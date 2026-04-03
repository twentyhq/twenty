import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const IntroRoot = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(6)};
  max-width: 556px;
  min-width: 0;
  width: 100%;
`;

type IntroProps = {
  children: ReactNode;
};

export function Intro({ children }: IntroProps) {
  return <IntroRoot>{children}</IntroRoot>;
}
