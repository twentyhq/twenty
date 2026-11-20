import { type HalftoneModelProps } from '@/platform/visuals/rigs/HalftoneModel';
import { paletteColorNumber } from '@/tokens';

// PROTOTYPE (?direction=e): the FAQ's row halftone, tone on tone (iron on the
// page black), on the target: finding the right partner. Stand-in until a
// map pin model exists.
export const PARTNERS_STAGE_CRAFT_HALFTONE: Pick<
  HalftoneModelProps,
  'modelUrl' | 'settings'
> = {
  modelUrl: '/models/target.glb',
  settings: {
    previewDistance: 4.6,
    modelOffsetY: 0.1,
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
      glowStrength: 0,
      rowMerge: 0,
      highlightOpen: 0,
      shadowGrouping: 0,
      shadowCrush: 0,
      dashColor: paletteColorNumber('iron'),
    },
    animation: {
      autoRotateEnabled: false,
      followDragEnabled: false,
      rotateEnabled: true,
      rotateAxis: 'y',
      rotateSpeed: 0.08,
      rotatePingPong: false,
    },
  },
};
