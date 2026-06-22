import { paletteColorNumber } from '@/tokens';

import { type HalftoneModelProps } from '@/platform/visuals/rigs/HalftoneModel';

// The authored footer model: charcoal rows breathing on the black stage,
// held at its baked pose (the old hook's drag handler is authored-disabled).
export const FOOTER_BACKDROP: Pick<
  HalftoneModelProps,
  'modelUrl' | 'settings' | 'initialPose'
> = {
  modelUrl: '/models/footer.glb',
  settings: {
    previewDistance: 4,
    lighting: {
      intensity: 4,
      fillIntensity: 1.33,
      ambientIntensity: 0.28,
      angleDegrees: 167,
      height: 2.1,
    },
    material: {
      roughness: 0.42,
      metalness: 0.16,
    },
    halftone: {
      variant: 'rows',
      numRows: 124,
      contrast: 2.7,
      power: 1,
      shading: 2.9,
      baseInk: 0.19,
      maxBar: 0.25,
      cellRatio: 2.2,
      cutoff: 0.02,
      glowStrength: 0,
      rowMerge: 0,
      highlightOpen: 0,
      shadowGrouping: 0,
      shadowCrush: 0,
      dashColor: paletteColorNumber('charcoal'),
    },
    animation: {
      autoRotateEnabled: false,
      followDragEnabled: false,
      rotateEnabled: false,
      breatheEnabled: true,
      breatheAmount: 0.04,
      breatheSpeed: 0.8,
    },
  },
  initialPose: {
    rotationX: -0.5858908325312259,
    rotationY: 0.363343542024313,
    targetRotationX: -0.5858908325312265,
    targetRotationY: 0.363343542024313,
    timeElapsed: 287.372499999977,
  },
};
