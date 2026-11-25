import { type HalftoneImageBackdropProps } from '@/platform/visuals/rigs/HalftoneImageBackdrop';
import { paletteColorNumber } from '@/tokens';

// The creator hero's full-bleed field, on the integrator hero's settings
// (INTEGRATOR_HERO_BACKDROP): ribbons of fine lines crossing behind the copy,
// drawn by ribbons.py, in grey dashes with a slow wave so the field moves.
// The source is white behind the copy, so no dash lands under the heading or
// the buttons; under the cursor the dashes turn blue.
export const CREATOR_HERO_BACKDROP: Pick<
  HalftoneImageBackdropProps,
  'imageUrl' | 'settings'
> = {
  imageUrl: '/images/partners/program-hero/creator-ribbons.webp',
  settings: {
    previewDistance: 4,
    imageFit: 'cover',
    verticalAnchor: 0.5,
    applyToDarkAreas: true,
    contrast: 1,
    halftone: {
      scale: 9,
      power: -0.35,
      width: 0.34,
      minimumTone: 0,
      dashColor: paletteColorNumber('stone'),
      hoverDashColor: paletteColorNumber('blue'),
    },
    hover: {
      halftoneEnabled: true,
      // 0: under the cursor the dashes swell and turn blue, but white stays white,
      // so no dash appears over the copy or the hero's own element.
      halftonePowerShift: 0,
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
      enabled: true,
      amount: 1.5,
      speed: 0.6,
    },
    // the backdrop sits under a pointer-events-none layer: track the window,
    // as the home hero does, and leave the copy out of the hover
    pointerExcludeSelector: '[data-halftone-exclude]',
    pointerScope: 'window',
  },
};
