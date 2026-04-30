import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

import { theme } from '@/theme';

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: ${theme.spacing(2)};
  justify-content: center;
  row-gap: ${theme.spacing(1)};
`;

type CtaProps = {
  children: ReactNode;
};

export function Cta({ children }: CtaProps) {
  return <Actions>{children}</Actions>;
}
