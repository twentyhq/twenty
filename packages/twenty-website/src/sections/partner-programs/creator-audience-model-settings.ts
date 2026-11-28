import { type HalftoneModelProps } from '@/platform/visuals/rigs/HalftoneModel';
import { paletteColorNumber } from '@/tokens';

// The audience objects, read like the home cards (three-cards/
// card-model-configs.ts): the same camera, light and halftone, one blue,
// slowly turning.
export const CREATOR_AUDIENCE_MODEL_SETTINGS = {
  previewDistance: 4.5,
  lighting: {
    intensity: 1.5,
    fillIntensity: 0.48,
    ambientIntensity: 0.3,
    angleDegrees: 53,
    height: 2,
  },
  material: {
    surface: 'solid',
    color: 0xd4d0c8,
    roughness: 0.42,
    metalness: 0.15,
  },
  halftone: {
    variant: 'band',
    scale: 14,
    power: 0.4,
    width: 0.5,
    dashColor: paletteColorNumber('blue'),
    hoverDashColor: paletteColorNumber('blue'),
  },
  animation: {
    autoRotateEnabled: true,
    autoSpeed: 0.3,
    autoWobble: 0.04,
    followDragEnabled: false,
    springReturnEnabled: true,
    springDamping: 0.6,
    springStrength: 0.06,
  },
} satisfies HalftoneModelProps['settings'];
