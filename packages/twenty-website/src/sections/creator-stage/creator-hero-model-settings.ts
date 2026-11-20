import { type HalftoneModelProps } from '@/platform/visuals/rigs/HalftoneModel';
import { paletteColorNumber } from '@/tokens';

// PROTOTYPE the megaphone as the one lit object of the dark stage.
export const CREATOR_HERO_MODEL_SETTINGS = {
  previewDistance: 3.3,
  lighting: {
    intensity: 2.6,
    fillIntensity: 0.3,
    ambientIntensity: 0.1,
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
    scale: 9,
    power: -0.7,
    width: 0.62,
    toneTarget: 'light',
    dashColor: paletteColorNumber('white'),
    hoverDashColor: paletteColorNumber('pink'),
  },
  animation: {
    autoRotateEnabled: true,
    autoSpeed: 0.12,
    autoWobble: 0.2,
    followDragEnabled: true,
    hoverHalftoneEnabled: true,
    hoverEase: 0.19,
    springReturnEnabled: true,
    springDamping: 0.6,
    springStrength: 0.06,
  },
} satisfies HalftoneModelProps['settings'];
