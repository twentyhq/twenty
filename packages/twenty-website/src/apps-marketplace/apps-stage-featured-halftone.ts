import { type HalftoneImageBackdropProps } from '@/platform/visuals/rigs/HalftoneImageBackdrop';
import { paletteColorNumber } from '@/tokens';

// PROTOTYPE (?direction=e): the featured app's own logo redrawn in Twenty's
// halftone, iron dashes on the page black. The hover light warms nearby
// dashes, as on the case-study promo.
export const APPS_STAGE_FEATURED_HALFTONE: HalftoneImageBackdropProps['settings'] =
  {
    previewDistance: 6.5,
    imageFit: 'contain',
    contrast: 1.2,
    halftone: {
      scale: 18,
      power: -0.07,
      width: 0.46,
      minimumTone: 0,
      dashColor: paletteColorNumber('iron'),
      hoverDashColor: paletteColorNumber('fog'),
    },
    hover: {
      halftoneEnabled: false,
      halftonePowerShift: 0.42,
      halftoneRadius: 0.2,
      halftoneWidthShift: -0.18,
      lightEnabled: true,
      lightIntensity: 1.2,
      lightRadius: 0.32,
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
