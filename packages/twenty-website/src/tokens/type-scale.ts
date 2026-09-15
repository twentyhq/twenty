// Type is stepped, not viewport-fluid: sizes are designed, testable states
// and words reflowing between lines (with text-wrap: balance) is the
// responsive mechanism — the Linear model. Measures stay fluid; type steps.
// Values are font-base multipliers; lineHeight of null means unitless 1.55
// (running text).
export type TypeStep = { size: number; lineHeight: number | null };

export type TypeRamp = { base: TypeStep; md: TypeStep };

export const TYPE_SCALE: Record<
  | 'display'
  | 'headingXl'
  | 'headingLg'
  | 'headingMd'
  | 'headingSm'
  | 'headingXs'
  | 'eyebrow'
  | 'bodyMd'
  | 'bodySm'
  | 'bodyXs',
  TypeRamp
> = {
  // Decorative display tier (the marquee's loud rows) — 2x headingLg, so it
  // keeps the system's proportions and line-height. Mobile (base) is tuned
  // independently of the desktop step.
  display: {
    base: { size: 20, lineHeight: 23 },
    md: { size: 30, lineHeight: 33 },
  },
  headingXl: {
    base: { size: 15, lineHeight: 16.5 },
    md: { size: 20, lineHeight: 21.5 },
  },
  headingLg: {
    base: { size: 10, lineHeight: 11.5 },
    md: { size: 15, lineHeight: 16.5 },
  },
  headingMd: {
    base: { size: 10, lineHeight: 11.5 },
    md: { size: 12, lineHeight: 14 },
  },
  headingSm: {
    base: { size: 8, lineHeight: 10 },
    md: { size: 8, lineHeight: 10 },
  },
  headingXs: {
    base: { size: 4.5, lineHeight: 6 },
    md: { size: 5.5, lineHeight: 7 },
  },
  // flat by design: the eyebrow never scales with viewport.
  eyebrow: {
    base: { size: 4.5, lineHeight: 6 },
    md: { size: 4.5, lineHeight: 6 },
  },
  bodyMd: {
    base: { size: 4, lineHeight: null },
    md: { size: 4.5, lineHeight: null },
  },
  bodySm: {
    base: { size: 4, lineHeight: null },
    md: { size: 4, lineHeight: null },
  },
  bodyXs: {
    base: { size: 3, lineHeight: null },
    md: { size: 3, lineHeight: null },
  },
};
