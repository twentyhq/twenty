import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { CSSProperties, ElementType, ReactNode } from 'react';

const GridRoot = styled.div`
  align-items: var(--ds-grid-align, stretch);
  box-sizing: border-box;
  display: grid;
  gap: var(--ds-grid-gap, 0);
  grid-template-columns: var(--ds-grid-columns, 1fr);
  min-width: 0;
`;

export type GridProps = {
  /**
   * Number of equal-width columns (mapped to `repeat(n, 1fr)`) or a
   * raw `grid-template-columns` string (`'1fr 2fr'`, `'auto 1fr auto'`,
   * etc.) when the layout isn't a uniform grid.
   */
  columns: number | string;
  /** Spacing multiplier passed to `theme.spacing(gap)`. */
  gap?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

const ALIGN_TO_GRID: Record<NonNullable<GridProps['align']>, string> = {
  start: 'start',
  center: 'center',
  end: 'end',
  stretch: 'stretch',
};

/**
 * CSS grid wrapper. Use the numeric `columns` form for plain N-column
 * layouts; pass a string for non-uniform tracks.
 *
 * Responsive grids should compose this with a media-queried Linaria
 * styled wrapper rather than baking breakpoint logic into the
 * primitive. Sections rarely share a single responsive grid contract,
 * so keeping this primitive layout-only avoids a leaky API.
 */
export function Grid({
  align,
  as,
  children,
  className,
  columns,
  gap,
  style,
}: GridProps) {
  const cssVars: Record<string, string> = {};
  if (gap !== undefined) {
    cssVars['--ds-grid-gap'] = theme.spacing(gap);
  }
  if (align !== undefined) {
    cssVars['--ds-grid-align'] = ALIGN_TO_GRID[align];
  }
  cssVars['--ds-grid-columns'] =
    typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns;

  return (
    <GridRoot as={as} className={className} style={{ ...cssVars, ...style }}>
      {children}
    </GridRoot>
  );
}
