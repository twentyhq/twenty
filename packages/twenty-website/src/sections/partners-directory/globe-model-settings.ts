import { type HalftoneModelProps } from '@/platform/visuals/rigs/HalftoneModel';
import { paletteColorNumber } from '@/tokens';

import { GLOBE_VIEW } from './globe-view';

// The hero globe through the site's halftone engine: the land raised on the
// sphere, lit from the side so the density runs from full blue on the lit
// land to sparse dots on the far edge. It turns slowly on its pole from the
// view set in globe-view.ts, and can be dragged round.
export const GLOBE_MODEL_SETTINGS = {
  previewDistance: GLOBE_VIEW.previewDistance,
  lighting: {
    intensity: 1.3,
    fillIntensity: 0.6,
    ambientIntensity: 0.3,
    angleDegrees: 128,
    height: 2.2,
  },
  material: {
    surface: 'solid',
    color: 0xd4d0c8,
    roughness: 0.42,
    metalness: 0.2,
  },
  halftone: {
    variant: 'band',
    scale: 10,
    power: -1.8,
    width: 1.4,
    dashColor: paletteColorNumber('blue'),
    hoverDashColor: paletteColorNumber('blue'),
  },
  animation: {
    autoRotateEnabled: true,
    autoSpeed: 0.12,
    autoWobble: 0.02,
    followDragEnabled: true,
    springReturnEnabled: true,
    springDamping: 0.6,
    springStrength: 0.06,
  },
} satisfies HalftoneModelProps['settings'];
