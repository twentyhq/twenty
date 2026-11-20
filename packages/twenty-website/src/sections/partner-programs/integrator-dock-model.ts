import { type HalftoneModelProps } from '@/platform/visuals/rigs/HalftoneModel';

import { INTEGRATOR_COIN_MODEL } from './integrator-coin-model-settings';

// At 32px in the apply dock the model needs a finer dash grid to read.
export const INTEGRATOR_DOCK_MODEL = {
  ...INTEGRATOR_COIN_MODEL,
  settings: {
    ...INTEGRATOR_COIN_MODEL.settings,
    halftone: { ...INTEGRATOR_COIN_MODEL.settings.halftone, scale: 3 },
  },
} satisfies Pick<HalftoneModelProps, 'modelUrl' | 'settings' | 'initialPose'>;
