import { paletteColorNumber } from '@/tokens';

import { type HalftoneImageBackdropProps } from '@/platform/visuals/rigs/halftone-image-backdrop';

// The authored monolith: ash band halftone over the masked image, with the
// subtle hover light (the old mount runs a continuous loop for it).
export const MONOLITH_VISUAL: Pick<
  HalftoneImageBackdropProps,
  'imageUrl' | 'settings'
> = {
  imageUrl: '/images/home/problem/monolith-problem.webp',
  settings: {
    previewDistance: 4,
    // The old mount's image shader hardcodes the cover branch.
    imageFit: 'cover',
    contrast: 1,
    halftone: {
      scale: 10,
      power: 0.21,
      width: 0.65,
      // The monolith shader has no tone floor.
      minimumTone: 0,
      dashColor: paletteColorNumber('ash'),
      hoverDashColor: paletteColorNumber('ash'),
    },
    hover: {
      halftoneEnabled: false,
      halftonePowerShift: 0.42,
      halftoneRadius: 0.2,
      halftoneWidthShift: -0.18,
      lightEnabled: true,
      lightIntensity: 0.13,
      lightRadius: 1,
      fadeIn: 18,
      fadeOut: 7,
    },
    pointer: {
      follow: 0.38,
      velocityDamping: 0.82,
    },
    wave: {
      enabled: false,
      amount: 2,
      speed: 1,
    },
    virtualRenderHeight: 768,
  },
};
