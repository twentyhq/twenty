'use client';

import { HELPED_BASE_SETTINGS } from '../constants/helped-base-settings';
import type { HelpedHalftonePose } from '../types/helped-halftone-pose';
import { HelpedHalftoneModel } from './HelpedHalftoneModel';
import { HELPED_VISUAL_MODEL_URLS } from '../constants/helped-visual-model-urls';

const TARGET_SETTINGS = {
  ...HELPED_BASE_SETTINGS,
  halftone: {
    enabled: true,
    scale: 25.64,
    power: -1.24,
    width: 0.5,
    imageContrast: 1,
    dashColor: '#ED87FC',
    hoverDashColor: '#ED87FC',
  },
};

const TARGET_INITIAL_POSE: HelpedHalftonePose = {
  autoElapsed: 0.05,
  rotateElapsed: 0,
  rotationX: -1.6874445801116057e-120,
  rotationY: 1.5322979021809315e-120,
  rotationZ: -4.56607033616335e-124,
  targetRotationX: 0,
  targetRotationY: 0,
  timeElapsed: 94.36910000002324,
};

export function Target() {
  return (
    <HelpedHalftoneModel
      initialPose={TARGET_INITIAL_POSE}
      label="target.glb"
      modelUrl={HELPED_VISUAL_MODEL_URLS.target}
      previewDistance={4}
      settings={TARGET_SETTINGS}
    />
  );
}
