import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { CSSProperties, ReactNode } from 'react';

const ContainerRoot = styled.div`
  margin: 0 auto;
  max-width: ${theme.breakpoints.maxContent}px;
  width: 100%;
`;

export type ContainerProps = {
  children: ReactNode;
  className?: string;
  'data-scheme'?: string;
  style?: CSSProperties;
};

export function Container({
  children,
  className,
  'data-scheme': dataScheme,
  style,
}: ContainerProps) {
  return (
    <ContainerRoot className={className} data-scheme={dataScheme} style={style}>
      {children}
    </ContainerRoot>
  );
}
