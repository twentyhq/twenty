import { type HalftoneModelProps } from '@/platform/visuals/rigs/HalftoneModel';
import { paletteColorNumber } from '@/tokens';

// The hero globe through the site's halftone engine: the land raised on the
// sphere, lit from the side so the density runs from full blue on the lit
// land to sparse dashes on the far edge. Turns slowly, like the site's other
// shapes.
export const GLOBE_MODEL_SETTINGS = {
  previewDistance: 4.5,
  lighting: {
    intensity: 2.1,
    fillIntensity: 0.18,
    ambientIntensity: 0.12,
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
    scale: 11,
    power: 0.16,
    width: 0.62,
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
