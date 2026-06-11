import { paletteColorNumber } from '@/tokens';

import { type HalftoneModelProps } from '@/platform/visuals/rigs/halftone-model';

// The authored hourglass: legacy row halftone in brand blue, slow
// auto-rotate with drag (no spring), baked to the pose the old site ships
// so the first frame matches.
export const HOURGLASS_VISUAL: Pick<
  HalftoneModelProps,
  'modelUrl' | 'settings' | 'initialPose'
> = {
  modelUrl: '/models/hourglass.glb',
  settings: {
    previewDistance: 4,
    lighting: {
      intensity: 3.4,
      fillIntensity: 1.5,
      ambientIntensity: 0.06,
      angleDegrees: 260,
      height: 0.8,
    },
    material: {
      roughness: 0.59,
      metalness: 0.02,
    },
    halftone: {
      variant: 'rows',
      dashColor: paletteColorNumber('blue'),
    },
    animation: {
      autoRotateEnabled: true,
      followDragEnabled: true,
      rotateEnabled: false,
      autoSpeed: 0.1,
      autoWobble: 0.05,
      dragSens: 0.003,
      dragFriction: 0.02,
      dragMomentum: true,
    },
  },
  initialPose: {
    autoElapsed: 51.68,
    rotationX: 3.5421542652497933,
    rotationY: 10.105974316283143,
    timeElapsed: 411.9648000000736,
  },
};
