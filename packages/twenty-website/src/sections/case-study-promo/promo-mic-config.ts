import { paletteColorNumber } from '@/tokens';

import { type HalftoneImageBackdropProps } from '@/platform/visuals/rigs/HalftoneImageBackdrop';

// The promo's square halftone: iron dashes form the meeting photo against the
// light panel (toneTarget dark -> applyToDarkAreas), with a hover light that
// turns nearby dashes blue. The image covers the square at previewDistance 4.
export const PROMO_MIC_VISUAL: Pick<
  HalftoneImageBackdropProps,
  'imageUrl' | 'settings'
> = {
  imageUrl: '/images/partners/promo/partner-meeting.webp',
  settings: {
    previewDistance: 4,
    imageFit: 'cover',
    applyToDarkAreas: true,
    contrast: 1,
    halftone: {
      scale: 16,
      power: -0.07,
      width: 0.46,
      minimumTone: 0,
      dashColor: paletteColorNumber('iron'),
      hoverDashColor: paletteColorNumber('blue'),
    },
    hover: {
      halftoneEnabled: false,
      halftonePowerShift: 0.42,
      halftoneRadius: 0.2,
      halftoneWidthShift: -0.18,
      lightEnabled: true,
      lightIntensity: 1.2,
      lightRadius: 0.32,
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
  },
};
