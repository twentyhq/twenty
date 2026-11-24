import { type HalftoneImageBackdropProps } from '@/platform/visuals/rigs/HalftoneImageBackdrop';
import { paletteColorNumber } from '@/tokens';

// The home hero bridge's halftone (HERO_BACKDROP): blue dashes as thick as the
// artwork is dark. The artwork is a handshake prepared like the bridge photo:
// lit skin pushed to white, creases and a thin contour kept dark, so the dashes
// draw the hands' outline and folds. Under the cursor the dashes swell, as on
// the old partner hero (PARTNER_HERO_VISUAL's hover), plus the home's light.
export const INTEGRATOR_HERO_BACKDROP: Pick<
  HalftoneImageBackdropProps,
  'imageUrl' | 'settings'
> = {
  imageUrl: '/images/partners/program-hero/integrator-handshake.webp',
  settings: {
    previewDistance: 4.2,
    imageFit: 'cover',
    verticalAnchor: 0.5,
    applyToDarkAreas: true,
    contrast: 1,
    halftone: {
      scale: 9,
      power: -0.35,
      width: 0.34,
      minimumTone: 0,
      dashColor: paletteColorNumber('blue'),
      hoverDashColor: paletteColorNumber('blue'),
    },
    hover: {
      halftoneEnabled: true,
      halftonePowerShift: 0.9,
      halftoneRadius: 0.6,
      halftoneWidthShift: -0.2,
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
  },
};
