import { paletteColorNumber } from '@/tokens';

import { type HalftoneImageBackdropProps } from '@/platform/visuals/rigs/halftone-image-backdrop';

// The partner hero halftone: stone dashes over the photo, going blue (#4a38f5)
// under the cursor. The image is contained at previewDistance 3.2, and the
// hover radii grow from the authored 6.1 framing as the image fills the frame.
export const PARTNER_HERO_VISUAL: Pick<
  HalftoneImageBackdropProps,
  'imageUrl' | 'settings'
> = {
  imageUrl: '/images/partner/hero/partners-hero.webp',
  settings: {
    previewDistance: 3.2,
    imageFit: 'contain',
    contrast: 1,
    halftone: {
      scale: 10,
      power: -0.1,
      width: 0.45,
      minimumTone: 0,
      dashColor: paletteColorNumber('stone'),
      hoverDashColor: paletteColorNumber('blue'),
    },
    hover: {
      halftoneEnabled: true,
      halftonePowerShift: 0.9,
      halftoneRadius: 0.6,
      halftoneWidthShift: -0.2,
      lightEnabled: false,
      lightIntensity: 0,
      lightRadius: 0.2,
      radiusReferenceDistance: 6.1,
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
