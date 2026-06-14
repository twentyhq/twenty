import { paletteColorNumber } from '@/tokens';

import { type HalftoneImageBackdropProps } from '@/platform/visuals/rigs/halftone-image-backdrop';

// The release-notes milestone halftone: chalk (#f3f3f3) dashes over the iron
// (#777777) panel, cover-fit over the milestone photo with a soft hover light.
// Auto-rotation (the old base config) is inert for image sources — a still
// halftone where only the hover light moves.
export const RELEASES_VISUAL: Pick<
  HalftoneImageBackdropProps,
  'imageUrl' | 'settings'
> = {
  imageUrl: '/images/releases/milestone.webp',
  settings: {
    previewDistance: 4,
    imageFit: 'cover',
    contrast: 1,
    halftone: {
      scale: 17.8,
      power: -0.07,
      width: 0.46,
      minimumTone: 0,
      dashColor: paletteColorNumber('chalk'),
      hoverDashColor: paletteColorNumber('chalk'),
    },
    hover: {
      halftoneEnabled: false,
      halftonePowerShift: 0.42,
      halftoneRadius: 0.2,
      halftoneWidthShift: -0.18,
      lightEnabled: true,
      lightIntensity: 1.2,
      lightRadius: 0.45,
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
