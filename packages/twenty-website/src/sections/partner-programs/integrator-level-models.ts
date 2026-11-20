import { type HalftoneModelProps } from '@/platform/visuals/rigs/HalftoneModel';
import { paletteColorNumber } from '@/tokens';

import { INTEGRATOR_COIN_MODEL } from './integrator-coin-model-settings';

type LevelModel = Pick<
  HalftoneModelProps,
  'modelUrl' | 'settings' | 'initialPose'
>;

const withShape = (modelUrl: string, dashColor: number): LevelModel => ({
  modelUrl,
  initialPose: INTEGRATOR_COIN_MODEL.initialPose,
  settings: {
    ...INTEGRATOR_COIN_MODEL.settings,
    halftone: {
      ...INTEGRATOR_COIN_MODEL.settings.halftone,
      scale: 9,
      dashColor,
    },
  },
});

// One shape and one accent per level, stand-ins for Thomas's 3D
// (dark stage only): the keycap in green for Integrator, the diamond in pink
// for Lead Integrator.
export const INTEGRATOR_LEVEL_MODELS: readonly LevelModel[] = [
  withShape('/models/code-keycap.glb', paletteColorNumber('green')),
  withShape('/models/diamond.glb', paletteColorNumber('pink')),
];
