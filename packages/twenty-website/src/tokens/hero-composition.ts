// The hero's internal vertical rhythm: the gap from the CTA row down to the
// visual beneath it. An authored measure (the old hero CTA-to-mockup spacing),
// not a spacing step — so it lives here rather than as a raw number inside the
// app-preview window scene. Every hero composition (Home / Pricing / Partner)
// and the product demo read the standard from this one place.
export const HERO_COMPOSITION: { ctaToVisualGapPx: number } = {
  ctaToVisualGapPx: 68,
};
