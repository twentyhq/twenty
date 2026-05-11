'use client';

import { HELPED_BASE_SETTINGS } from '../constants/helped-base-settings';
import type { HelpedHalftonePose } from '../types/helped-halftone-pose';
import { HelpedHalftoneModel } from './HelpedHalftoneModel';
import { HELPED_VISUAL_MODEL_URLS } from '../constants/helped-visual-model-urls';

const SPACESHIP_SETTINGS = {
  ...HELPED_BASE_SETTINGS,
  halftone: {
    enabled: true,
    scale: 16.64,
    power: -1.24,
    width: 0.5,
    imageContrast: 1,
    dashColor: '#89FC9A',
    hoverDashColor: '#89FC9A',
  },
};

const SPACESHIP_INITIAL_POSE: HelpedHalftonePose = {
  autoElapsed: 0.05,
  rotateElapsed: 0,
  rotationX: 6.34639162689903e-205,
  rotationY: 4.230976261030774e-203,
  rotationZ: 0,
  targetRotationX: 0,
  targetRotationY: 0,
  timeElapsed: 99.20160000002399,
};

export function Spaceship() {
  return (
    <HelpedHalftoneModel
      initialPose={SPACESHIP_INITIAL_POSE}
      label="spaceship.glb"
      modelUrl={HELPED_VISUAL_MODEL_URLS.spaceship}
      previewDistance={3.5}
      settings={SPACESHIP_SETTINGS}
    />
  );
}
