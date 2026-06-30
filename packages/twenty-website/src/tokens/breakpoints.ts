export type Breakpoint = 'sm' | 'md' | 'lg';

export const BREAKPOINT_PX: Record<Breakpoint, number> = {
  // sm charter: tablets may CAP/CENTER media and DENSIFY card grids inside
  // the stacked composition class — never engage desktop splits (md+) and
  // never touch the type scale (ramps interpolate 390->md continuously).
  // Prefer continuous max-width caps when a cap alone fixes the band.
  sm: 768,
  md: 921,
  lg: 1281,
};
