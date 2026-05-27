import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const CTAsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(4)};
  justify-content: center;
`;

type CtaProps = { children: ReactNode };

export function Cta({ children }: CtaProps) {
  return <CTAsContainer>{children}</CTAsContainer>;
}
