import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const CTAsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(3)};
  justify-content: center;
`;

// Shared hero call-to-action row.
export function HeroCta({ children }: { children: ReactNode }) {
  return <CTAsContainer>{children}</CTAsContainer>;
}
