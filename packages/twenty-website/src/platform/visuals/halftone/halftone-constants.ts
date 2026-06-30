// Shared physical constants of the halftone pipeline. Every session reads
// these — never redeclare locally.
export const HALFTONE_CONSTANTS = {
  // Fixed virtual render height: dash density stays authored at any
  // container size (the canvas upscales, the pattern does not).
  virtualRenderHeightPx: 768,
  // The camera distance the dash density was authored at; previewDistance
  // scales density relative to it.
  referencePreviewDistance: 4,
  minFootprintScale: 0.001,
  pointerEasingDefault: 0.12,
  pointerEasingAutorotateDrag: 0.08,
  autorotateVelocityDecay: 0.92,
};
