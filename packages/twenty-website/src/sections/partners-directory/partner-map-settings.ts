import { paletteColorNumber } from '@/tokens';

import { type HalftoneImageBackdropProps } from '@/platform/visuals/rigs/HalftoneImageBackdrop';

// The partner's region on its page, through the site's image halftone: an
// even tone, and the pointer shifts the dashes (the portraits' hover, no light).
export const PARTNER_MAP_SETTINGS: HalftoneImageBackdropProps['settings'] = {
  previewDistance: 4,
  imageFit: 'cover',
  contrast: 1,
  halftone: {
    scale: 8,
    power: 0.2,
    width: 0.6,
    minimumTone: 0,
    dashColor: paletteColorNumber('blue'),
    hoverDashColor: paletteColorNumber('blue'),
  },
  hover: {
    halftoneEnabled: true,
    halftonePowerShift: 0.42,
    halftoneRadius: 0.5,
    halftoneWidthShift: -0.18,
    lightEnabled: false,
    lightIntensity: 0,
    lightRadius: 0.2,
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
