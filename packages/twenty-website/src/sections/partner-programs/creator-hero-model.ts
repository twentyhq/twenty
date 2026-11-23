import { type HalftoneModelProps } from '@/platform/visuals/rigs/HalftoneModel';

import { PROGRAM_HERO_MODEL_SETTINGS } from './program-hero-model-settings';

// Final name: the file holds the megaphone until Thomas drops in the menu's play button.
export const CREATOR_HERO_MODEL = {
  modelUrl: '/models/creator-hero.glb',
  settings: PROGRAM_HERO_MODEL_SETTINGS,
} satisfies Pick<HalftoneModelProps, 'modelUrl' | 'settings'>;
