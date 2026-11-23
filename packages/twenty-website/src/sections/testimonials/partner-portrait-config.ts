import { paletteColorNumber } from '@/tokens';

import { type HalftoneImageBackdropProps } from '@/platform/visuals/rigs/HalftoneImageBackdrop';

// The home hero's bridge recipe on a cut-out portrait (white background,
// softened subject): blue dashes from its dark areas, uncropped. Only the
// shared settings live here; the image URL varies per author.
export const PARTNER_PORTRAIT_SETTINGS: HalftoneImageBackdropProps['settings'] =
  {
    previewDistance: 3,
    imageFit: 'contain',
    applyToDarkAreas: true,
    contrast: 1.7,
    halftone: {
      scale: 6,
      power: -0.12,
      width: 0.42,
      minimumTone: 0,
      dashColor: paletteColorNumber('blue'),
      hoverDashColor: paletteColorNumber('blue'),
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
