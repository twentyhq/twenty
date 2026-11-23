import { type HalftoneModelProps } from '@/platform/visuals/rigs/HalftoneModel';
import { paletteColorNumber } from '@/tokens';

// The services objects, read like the home cards: one blue, slowly turning.
export const SERVICE_MODEL_SETTINGS = {
  previewDistance: 5.4,
  lighting: {
    intensity: 1.8,
    fillIntensity: 0.25,
    ambientIntensity: 0.18,
    angleDegrees: 132,
    height: 2.6,
  },
  material: {
    surface: 'solid',
    color: 0xd4d0c8,
    roughness: 0.38,
    metalness: 0.26,
  },
  halftone: {
    variant: 'band',
    scale: 7,
    power: 0.16,
    width: 0.62,
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
