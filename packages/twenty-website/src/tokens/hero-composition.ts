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
  visualBannerHeight: string;
} = {
  headingMeasurePx: 672,
  bodyMeasurePx: 591,
  introGapSpacing: 8,
  ctaToVisualGapPx: 68,
  // from the bottom of the actions to the bottom of the hero, its padding
  // included: the partners globe banner at desktop (0.36 × 1100 + 68), which
  // every other hero matches
  belowActionsPx: 464,
  // every hero's visual banner (the partners globe, the halftone scenes): what
  // fills the height under the actions at desktop (464 − 68 = 396), scaling
  // down with the width to 202 on a phone, as the globe always did
  visualBannerHeight: 'clamp(202px, 36vw, 396px)',
};
