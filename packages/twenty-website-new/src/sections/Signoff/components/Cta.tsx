import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

import { theme } from '@/theme';

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(1)};
  justify-content: center;
`;

type CtaProps = {
  children: ReactNode;
};

export function Cta({ children }: CtaProps) {
  return <Actions>{children}</Actions>;
}
