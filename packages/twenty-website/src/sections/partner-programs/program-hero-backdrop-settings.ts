import { paletteColorNumber } from '@/tokens';

import { type HalftoneImageBackdropProps } from '@/platform/visuals/rigs/HalftoneImageBackdrop';

// Tone on tone, so the centred copy stays readable.
export const PROGRAM_HERO_BACKDROP_SETTINGS: HalftoneImageBackdropProps['settings'] =
  {
    previewDistance: 3.2,
    imageFit: 'width',
    verticalAnchor: 0.5,
    contrast: 1,
    halftone: {
      scale: 12,
      power: -0.07,
      width: 0.34,
      minimumTone: 0,
      dashColor: paletteColorNumber('graphite'),
      hoverDashColor: paletteColorNumber('graphite'),
    },
    hover: {
      halftoneEnabled: false,
      halftonePowerShift: 0,
      halftoneRadius: 0.6,
      halftoneWidthShift: 0,
      lightEnabled: true,
      lightIntensity: 0.8,
      lightRadius: 0.14,
      lightVerticalFade: 0.5,
      fadeIn: 18,
      fadeOut: 7,
    },
    pointer: {
      follow: 0.38,
      velocityDamping: 0.82,
    },
    wave: {
      enabled: false,
      amount: 0,
      speed: 1,
    },
    pointerExcludeSelector: '[data-halftone-exclude]',
    pointerScope: 'window',
  };
