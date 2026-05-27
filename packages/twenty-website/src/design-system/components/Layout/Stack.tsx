import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { CSSProperties, ElementType, ReactNode } from 'react';

const StackRoot = styled.div`
  align-items: var(--ds-stack-align, stretch);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--ds-stack-gap, 0);
  min-width: 0;
`;

export type StackAlign = 'start' | 'center' | 'end' | 'stretch';

export type StackProps = {
  gap?: number;
  align?: StackAlign;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

const ALIGN_TO_FLEX: Record<StackAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};

export function Stack({
  align,
  as,
  children,
  className,
  gap,
  style,
}: StackProps) {
  const cssVars: Record<string, string> = {};
  if (gap !== undefined) {
    cssVars['--ds-stack-gap'] = theme.spacing(gap);
  }
  if (align !== undefined) {
    cssVars['--ds-stack-align'] = ALIGN_TO_FLEX[align];
  }

  return (
    <StackRoot as={as} className={className} style={{ ...cssVars, ...style }}>
      {children}
    </StackRoot>
  );
}
