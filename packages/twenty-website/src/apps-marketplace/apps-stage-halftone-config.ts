import { type HalftoneModelProps } from '@/platform/visuals/rigs/HalftoneModel';
import { paletteColorNumber } from '@/tokens';

// PROTOTYPE (?direction=e): the FAQ backdrop's row halftone, tone on tone
// (iron dashes on the page black), on the keycap model: the closest shape the
// site has to an app tile. Turns on its own axis, never with the logo ring.
export const APPS_STAGE_HALFTONE: Pick<
  HalftoneModelProps,
  'modelUrl' | 'settings'
> = {
  modelUrl: '/models/code-keycap.glb',
  settings: {
    previewDistance: 4.4,
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
