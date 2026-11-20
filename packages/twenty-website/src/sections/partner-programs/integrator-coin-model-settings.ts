import { type HalftoneModelProps } from '@/platform/visuals/rigs/HalftoneModel';
import { paletteColorNumber } from '@/tokens';

// The money model at icon size (level cards, apply dock) until
// Thomas's shapes land. Finer dashes than the 400px closing model so a small
// render keeps its detail, and a slow, steady turn without drag.
export const INTEGRATOR_COIN_MODEL = {
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
      scale: 6,
      power: -1.24,
      width: 0.5,
      dashColor: paletteColorNumber('green'),
      hoverDashColor: paletteColorNumber('white'),
    },
    animation: {
      autoRotateEnabled: true,
      autoSpeed: 0.3,
      autoWobble: 0.04,
      breatheEnabled: true,
      breatheAmount: 0.015,
      breatheSpeed: 0.25,
      followDragEnabled: false,
      dragSens: 0.008,
      dragFriction: 0.08,
      dragMomentum: true,
      springReturnEnabled: true,
      springDamping: 0.5,
      springStrength: 0.1,
    },
  },
  initialPose: { autoElapsed: 0, timeElapsed: 0 },
} satisfies Pick<HalftoneModelProps, 'modelUrl' | 'settings' | 'initialPose'>;
