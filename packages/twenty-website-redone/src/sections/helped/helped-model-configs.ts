import { paletteColorNumber } from '@/tokens';

import { type HalftoneModelProps } from '@/platform/visuals/rigs/HalftoneModel';
import { type HelpedVisualId } from './helped.data';

// The authored helped models: glass-surface band halftone, breathing, drag
// with spring return, no auto-rotate. Poses are the old site's baked frames
// (near-zero denormal rotations treated as zero).
const HELPED_BASE = {
  previewDistance: 4,
  lighting: {
    intensity: 3,
    fillIntensity: 0,
    ambientIntensity: 0,
    angleDegrees: 47,
    height: 1.4,
  },
  material: {
    surface: 'glass',
    color: 0x7d7d7d,
    roughness: 0.26,
    metalness: 0.15,
    thickness: 15.58,
    refraction: 3,
    environmentPower: 5,
  },
  animation: {
    autoRotateEnabled: false,
    breatheEnabled: true,
    breatheAmount: 0.015,
    breatheSpeed: 0.25,
    followDragEnabled: true,
    dragSens: 0.008,
    dragFriction: 0.08,
    dragMomentum: true,
    springReturnEnabled: true,
    springDamping: 0.5,
    springStrength: 0.1,
  },
} satisfies Partial<HalftoneModelProps['settings']> & {
  previewDistance: number;
};

export const HELPED_MODEL_CONFIGS: Record<
  HelpedVisualId,
  Pick<HalftoneModelProps, 'modelUrl' | 'settings' | 'initialPose'>
> = {
  target: {
    modelUrl: '/models/target.glb',
    settings: {
      ...HELPED_BASE,
      halftone: {
        variant: 'band',
        scale: 25.64,
        power: -1.24,
        width: 0.5,
        dashColor: paletteColorNumber('pink'),
        hoverDashColor: paletteColorNumber('pink'),
      },
    },
    initialPose: { autoElapsed: 0.05, timeElapsed: 94.3691 },
  },
  spaceship: {
    modelUrl: '/models/spaceship.glb',
    settings: {
      ...HELPED_BASE,
      previewDistance: 3.5,
      halftone: {
        variant: 'band',
        scale: 16.64,
        power: -1.24,
        width: 0.5,
        dashColor: paletteColorNumber('green'),
        hoverDashColor: paletteColorNumber('green'),
      },
    },
    initialPose: { autoElapsed: 0.05, timeElapsed: 99.2016 },
  },
  money: {
    modelUrl: '/models/money.glb',
    settings: {
      ...HELPED_BASE,
      previewDistance: 5,
      halftone: {
        variant: 'band',
        scale: 25.64,
        power: -1.24,
        width: 0.5,
        dashColor: paletteColorNumber('yellow'),
        hoverDashColor: paletteColorNumber('blue'),
      },
    },
    initialPose: { autoElapsed: 9.6044, timeElapsed: 303.7693 },
  },
};
