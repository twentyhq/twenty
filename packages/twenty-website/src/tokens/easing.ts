// The site's four motion curves. Components never write cubic-bezier values
// inline.
export const EASING: Record<
  'standard' | 'smooth' | 'gentle' | 'spring',
  string
> = {
  // transforms and slides (buttons, dropdowns, drawer)
  standard: 'cubic-bezier(0.22, 1, 0.36, 1)',
  // expand/collapse (accordion)
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  // color and opacity shifts
  gentle: 'cubic-bezier(0.16, 1, 0.3, 1)',
  // playful scale (FAQ toggle)
  spring: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
};
