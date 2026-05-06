import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { CSSProperties, ElementType, ReactNode } from 'react';

const InlineRoot = styled.div`
  align-items: var(--ds-inline-align, center);
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  flex-wrap: var(--ds-inline-wrap, nowrap);
  gap: var(--ds-inline-gap, 0);
  justify-content: var(--ds-inline-justify, flex-start);
  min-width: 0;
`;

export type InlineAlign = 'start' | 'center' | 'end' | 'baseline' | 'stretch';
export type InlineJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

export type InlineProps = {
  gap?: number;
  align?: InlineAlign;
  justify?: InlineJustify;
  wrap?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

const ALIGN_TO_FLEX: Record<InlineAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  baseline: 'baseline',
  stretch: 'stretch',
};

const JUSTIFY_TO_FLEX: Record<InlineJustify, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  'space-between': 'space-between',
  'space-around': 'space-around',
  'space-evenly': 'space-evenly',
};

export function Inline({
  align,
  as,
  children,
  className,
  gap,
  justify,
  style,
  wrap,
}: InlineProps) {
  const cssVars: Record<string, string> = {};
  if (gap !== undefined) {
    cssVars['--ds-inline-gap'] = theme.spacing(gap);
  }
  if (align !== undefined) {
    cssVars['--ds-inline-align'] = ALIGN_TO_FLEX[align];
  }
  if (justify !== undefined) {
    cssVars['--ds-inline-justify'] = JUSTIFY_TO_FLEX[justify];
  }
  if (wrap === true) {
    cssVars['--ds-inline-wrap'] = 'wrap';
  }

  return (
    <InlineRoot as={as} className={className} style={{ ...cssVars, ...style }}>
      {children}
    </InlineRoot>
  );
}
