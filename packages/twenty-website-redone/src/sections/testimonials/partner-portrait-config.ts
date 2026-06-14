import { paletteColorNumber } from '@/tokens';

import { type HalftoneImageBackdropProps } from '@/platform/visuals/rigs/halftone-image-backdrop';

// The author portrait as a halftone: white dashes in the photo's light areas
// (toneTarget light) on the dark testimonials panel, with a hover halftone
// shift + light. The image URL varies per author across the carousel, so only
// the shared settings live here.
export const PARTNER_PORTRAIT_SETTINGS: HalftoneImageBackdropProps['settings'] =
  {
    previewDistance: 4,
    imageFit: 'cover',
    contrast: 1,
    halftone: {
      scale: 8,
      power: -0.07,
      width: 0.46,
      minimumTone: 0,
      dashColor: paletteColorNumber('white'),
      hoverDashColor: paletteColorNumber('white'),
    },
    hover: {
      halftoneEnabled: true,
      halftonePowerShift: 0.42,
      halftoneRadius: 0.9,
      halftoneWidthShift: -0.18,
      lightEnabled: true,
      lightIntensity: 0.8,
      lightRadius: 0.2,
      // The studio's symmetric hoverEase 0.08 as the redone exp fade rate.
      fadeIn: 5,
      fadeOut: 5,
    },
    pointer: {
      follow: 0.08,
      velocityDamping: 0.82,
    },
    wave: {
      enabled: false,
      amount: 2,
      speed: 1,
    },
  };
