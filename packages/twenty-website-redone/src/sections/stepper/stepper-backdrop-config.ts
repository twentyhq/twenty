import { paletteColorNumber } from '@/tokens';

import { type HalftoneImageBackdropProps } from '@/platform/visuals/rigs/HalftoneImageBackdrop';

// The authored stepper backdrop: fog dashes over the worker image inside
// the graphite frame, brightening to white where the pointer hovers (the
// hover field tracks the whole visual area, not just the canvas). The old
// hook skips the visual entirely under reduced motion.
export const STEPPER_BACKDROP: Pick<
  HalftoneImageBackdropProps,
  'imageUrl' | 'settings'
> = {
  imageUrl: '/images/home/stepper/download-worker.webp',
  settings: {
    previewDistance: 4,
    imageFit: 'cover',
    contrast: 1.12,
    halftone: {
      scale: 12,
      power: 0.18,
      width: 0.72,
      minimumTone: 0.26,
      dashColor: paletteColorNumber('fog'),
      hoverDashColor: paletteColorNumber('white'),
    },
    hover: {
      halftoneEnabled: true,
      halftonePowerShift: 0.62,
      halftoneRadius: 0.6,
      halftoneWidthShift: -0.18,
      lightEnabled: false,
      lightIntensity: 0.12,
      lightRadius: 0.8,
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
  },
};
