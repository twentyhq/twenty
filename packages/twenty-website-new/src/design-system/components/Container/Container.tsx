import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const ContainerRoot = styled.div`
  margin: 0 auto;
  max-width: ${theme.breakpoints.maxContent}px;
  width: 100%;
`;

export type ContainerProps = { children: ReactNode; className?: string };

export function Container({ children, className }: ContainerProps) {
  return <ContainerRoot className={className}>{children}</ContainerRoot>;
}
