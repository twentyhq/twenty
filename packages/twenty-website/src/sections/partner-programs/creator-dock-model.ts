import { type HalftoneModelProps } from '@/platform/visuals/rigs/HalftoneModel';

import { CREATOR_TERMS_MODEL } from './creator-terms-model';

// At 32px in the apply dock the model needs a finer dash grid to read.
export const CREATOR_DOCK_MODEL = {
  ...CREATOR_TERMS_MODEL,
  settings: {
    ...CREATOR_TERMS_MODEL.settings,
    halftone: { ...CREATOR_TERMS_MODEL.settings.halftone, scale: 3 },
  },
} satisfies Pick<HalftoneModelProps, 'modelUrl' | 'settings' | 'initialPose'>;
