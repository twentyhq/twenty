import { type HalftoneModelProps } from '@/platform/visuals/rigs/HalftoneModel';
import { paletteColorNumber } from '@/tokens';

// PROTOTYPE slot for a dedicated integrator shape; the money model stands in.
// Green dashes on the dark stage: integrators' accent, tone on tone.
export const INTEGRATOR_CLOSING_MODEL = {
  modelUrl: '/models/money.glb',
  settings: {
    previewDistance: 4.6,
    lighting: {
      intensity: 3,
      fillIntensity: 0.2,
      ambientIntensity: 0.05,
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
    halftone: {
      variant: 'band',
      scale: 22,
      power: -1.24,
      width: 0.5,
      dashColor: paletteColorNumber('green'),
      hoverDashColor: paletteColorNumber('white'),
    },
    animation: {
      autoRotateEnabled: true,
      autoSpeed: 0.1,
      autoWobble: 0.08,
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
  },
  initialPose: { autoElapsed: 9.6044, timeElapsed: 303.7693 },
} satisfies Pick<HalftoneModelProps, 'modelUrl' | 'settings' | 'initialPose'>;
