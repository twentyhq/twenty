'use client';

import { HELPED_BASE_SETTINGS } from '../constants/helped-base-settings';
import type { HelpedHalftonePose } from '../types/helped-halftone-pose';
import { HelpedHalftoneModel } from './HelpedHalftoneModel';
import { HELPED_VISUAL_MODEL_URLS } from '../constants/helped-visual-model-urls';

const MONEY_SETTINGS = {
  ...HELPED_BASE_SETTINGS,
  halftone: {
    enabled: true,
    scale: 25.64,
    power: -1.24,
    width: 0.5,
    imageContrast: 1,
    dashColor: '#FEFFB7',
    hoverDashColor: '#4A38F5',
  },
};

const MONEY_INITIAL_POSE: HelpedHalftonePose = {
  autoElapsed: 9.604400000000004,
  rotateElapsed: 0,
  rotationX: 9.425994949837918e-229,
  rotationY: 2.798289108321203e-229,
  rotationZ: -2.301463116952276e-231,
  targetRotationX: 0,
  targetRotationY: 0,
  timeElapsed: 303.7692999998331,
};

export function Money() {
  return (
    <HelpedHalftoneModel
      initialPose={MONEY_INITIAL_POSE}
      label="money.glb"
      modelUrl={HELPED_VISUAL_MODEL_URLS.money}
      previewDistance={5}
      settings={MONEY_SETTINGS}
    />
  );
}
