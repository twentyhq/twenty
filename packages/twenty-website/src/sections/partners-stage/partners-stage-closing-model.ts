import { type HalftoneModelProps } from '@/platform/visuals/rigs/HalftoneModel';
import { paletteColorNumber } from '@/tokens';

// PROTOTYPE 3D slot: target.glb stands in until the asked-for shape exists
// (a map pin, echoing the atlas). Tone on tone, green only on hover.
export const PARTNERS_STAGE_CLOSING_MODEL: Pick<
  HalftoneModelProps,
  'modelUrl' | 'settings'
> = {
  modelUrl: '/models/target.glb',
  settings: {
    previewDistance: 3.4,
    lighting: {
      intensity: 2.4,
      fillIntensity: 0.25,
      ambientIntensity: 0.08,
      angleDegrees: 132,
      height: 2.6,
    },
    material: {
      surface: 'solid',
      color: 0xd4d0c8,
      roughness: 0.4,
      metalness: 0.24,
    },
    halftone: {
      variant: 'band',
      scale: 9,
      power: -0.7,
      width: 0.62,
      toneTarget: 'light',
      dashColor: paletteColorNumber('iron'),
      hoverDashColor: paletteColorNumber('green'),
    },
    animation: {
      autoRotateEnabled: true,
      autoSpeed: 0.1,
      autoWobble: 0.2,
      followDragEnabled: true,
      hoverHalftoneEnabled: true,
      hoverEase: 0.19,
      springReturnEnabled: true,
      springDamping: 0.6,
      springStrength: 0.06,
    },
  },
};
