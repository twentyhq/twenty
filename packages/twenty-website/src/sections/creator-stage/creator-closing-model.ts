import { type HalftoneModelProps } from '@/platform/visuals/rigs/HalftoneModel';
import { paletteColorNumber } from '@/tokens';

// PROTOTYPE the closing slot's object. money.glb stands in until a dedicated
// shape exists (an affiliate link, a chain of two rings): swap modelUrl only.
export const CREATOR_CLOSING_MODEL: Pick<
  HalftoneModelProps,
  'modelUrl' | 'settings'
> = {
  modelUrl: '/models/money.glb',
  settings: {
    previewDistance: 4.6,
    lighting: {
      intensity: 2.4,
      fillIntensity: 0.2,
      ambientIntensity: 0.08,
      angleDegrees: 120,
      height: 2.2,
    },
    material: {
      surface: 'solid',
      color: 0xd4d0c8,
      roughness: 0.38,
      metalness: 0.26,
    },
    halftone: {
      variant: 'band',
      scale: 10,
      power: -0.5,
      width: 0.6,
      dashColor: paletteColorNumber('pink'),
      hoverDashColor: paletteColorNumber('white'),
    },
    animation: {
      autoRotateEnabled: true,
      autoSpeed: 0.18,
      autoWobble: 0.3,
      followDragEnabled: true,
      hoverHalftoneEnabled: true,
      springReturnEnabled: true,
      springDamping: 0.6,
      springStrength: 0.06,
    },
  },
};
