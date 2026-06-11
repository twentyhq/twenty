import { paletteColorNumber } from '@/tokens';

import { type HalftoneModelProps } from '@/platform/visuals/rigs/halftone-model';

// The authored FAQ background model: row halftone in brand blue, slow -z
// rotation, lifted high in frame, baked clocks. No pointer interaction.
export const FAQ_BACKDROP: Pick<
  HalftoneModelProps,
  'modelUrl' | 'settings' | 'initialPose'
> = {
  modelUrl: '/models/faq.glb',
  settings: {
    previewDistance: 4,
    modelOffsetY: 0.52,
    lighting: {
      intensity: 3.1,
      fillIntensity: 0.15,
      ambientIntensity: 0.08,
      angleDegrees: 45,
      height: 2,
    },
    material: {
      roughness: 0.42,
      metalness: 0.16,
    },
    halftone: {
      variant: 'rows',
      numRows: 127,
      contrast: 1.6,
      power: 1.2,
      shading: 1.6,
      baseInk: 0.16,
      maxBar: 0.24,
      cellRatio: 2.2,
      cutoff: 0.02,
      dashColor: paletteColorNumber('blue'),
    },
    animation: {
      autoRotateEnabled: false,
      followDragEnabled: false,
      rotateEnabled: true,
      rotateAxis: '-z',
      rotateSpeed: 0.1,
      rotatePingPong: false,
    },
  },
  initialPose: {
    rotateElapsed: 275.10000000007847,
    timeElapsed: 249.21849999998116,
  },
};
