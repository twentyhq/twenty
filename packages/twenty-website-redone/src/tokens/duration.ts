// Motion durations, smallest to largest. Components pair these with the
// EASING curves (or browser keywords); raw millisecond literals in
// transition/animation declarations are a lint-audit smell.
export const DURATION: {
  xxs: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
} = {
  xxs: '150ms',
  xs: '200ms',
  sm: '220ms',
  md: '300ms',
  lg: '400ms',
  xl: '600ms',
};
