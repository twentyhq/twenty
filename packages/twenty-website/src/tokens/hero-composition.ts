// The hero's composition, shared by every centered hero (Home, Pricing,
// Partner, Apps, the partner programs): the intro's measures and rhythm, the
// gap from the CTA row down to the visual, and the hero's height under its
// actions, the same on every page.
export const HERO_COMPOSITION: {
  headingMeasurePx: number;
  bodyMeasurePx: number;
  introGapSpacing: number;
  ctaToVisualGapPx: number;
  belowActionsPx: number;
} = {
  headingMeasurePx: 672,
  bodyMeasurePx: 591,
  introGapSpacing: 8,
  ctaToVisualGapPx: 68,
  // from the bottom of the actions to the bottom of the hero, its padding
  // included: the partners globe banner at desktop (0.36 × 1100 + 68), which
  // every other hero matches
  belowActionsPx: 464,
};
