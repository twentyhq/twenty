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
  /** Spacing multiplier passed to `theme.spacing(gap)`. */
  gap?: number;
  align?: StackAlign;
  /**
   * HTML tag the wrapper renders as. Defaults to `div`. Use `'ul'` /
   * `'ol'` for navigation/menu lists, `'section'` for landmarks, etc.
   */
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

/**
 * Vertical flex stack. Use as the default scaffolding wrapper instead
 * of an ad-hoc `display: flex; flex-direction: column` block.
 *
 * `gap` is a spacing multiplier (`theme.spacing(gap)`). For more exotic
 * gap values (clamp, vh, etc.) drop the primitive and write a bespoke
 * styled div — the primitive intentionally only covers the recurring
 * `theme.spacing` case.
 */
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
