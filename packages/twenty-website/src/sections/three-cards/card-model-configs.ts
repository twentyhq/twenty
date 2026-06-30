import { paletteColorNumber } from '@/tokens';
import { type HalftoneEffectSettingsOverrides } from '@/platform/visuals/halftone/halftone-settings';

import { type HalftoneModelProps } from '@/platform/visuals/rigs/HalftoneModel';
import { type IllustrationId } from './three-cards.data';

// The authored three-cards models: solid-surface band halftone in brand
// blue, slow auto-rotate, drag with spring return on the white stages.
// Diamond keeps the studio-era legacy normalization (max-dimension scale,
// post-rotate) and a zero pose it was authored against.
const CARD_BASE = {
  previewDistance: 4.5,
  lighting: {
    intensity: 1.5,
    fillIntensity: 0.48,
    ambientIntensity: 0.3,
    angleDegrees: 53,
    height: 2,
  },
  material: {
    surface: 'solid',
    color: 0xd4d0c8,
    roughness: 0.42,
    metalness: 0.15,
    thickness: 150,
    refraction: 2,
    environmentPower: 5,
  },
  animation: {
    autoRotateEnabled: true,
    autoSpeed: 0.1,
    autoWobble: 0,
    followDragEnabled: true,
    hoverEase: 0.19,
    dragSens: 0.008,
    dragFriction: 0.08,
    dragMomentum: true,
    springReturnEnabled: true,
    springDamping: 0.6,
    springStrength: 0.06,
  },
} satisfies Partial<HalftoneModelProps['settings']> & {
  previewDistance: number;
};

const CARD_HALFTONE: HalftoneEffectSettingsOverrides = {
  variant: 'band',
  scale: 14,
  power: 0.4,
  width: 0.5,
};

const BASE_POSE = {
  autoElapsed: 11.523399999928483,
  rotationY: 1.1339840023154435,
  timeElapsed: 11.523399999928476,
};

export const CARD_MODEL_CONFIGS: Record<
  IllustrationId,
  Pick<
    HalftoneModelProps,
    'modelUrl' | 'settings' | 'initialPose' | 'geometryOptions'
  >
> = {
  diamond: {
    modelUrl: '/models/diamond.glb',
    settings: {
      ...CARD_BASE,
      halftone: {
        ...CARD_HALFTONE,
        dashColor: paletteColorNumber('blue'),
        hoverDashColor: paletteColorNumber('blue'),
      },
    },
    geometryOptions: { legacyNormalization: true, postRotateZ: 1 },
    initialPose: { autoElapsed: 0, timeElapsed: 0 },
  },
  eye: {
    modelUrl: '/models/eye.glb',
    settings: {
      ...CARD_BASE,
      halftone: {
        ...CARD_HALFTONE,
        dashColor: paletteColorNumber('blue'),
        hoverDashColor: paletteColorNumber('blue'),
      },
    },
    initialPose: BASE_POSE,
  },
  flash: {
    modelUrl: '/models/flash.glb',
    settings: {
      ...CARD_BASE,
      halftone: {
        ...CARD_HALFTONE,
        dashColor: paletteColorNumber('blue'),
        hoverDashColor: paletteColorNumber('blue'),
      },
    },
    initialPose: BASE_POSE,
  },
  lock: {
    modelUrl: '/models/lock.glb',
    settings: {
      ...CARD_BASE,
      halftone: {
        ...CARD_HALFTONE,
        dashColor: paletteColorNumber('blue'),
        hoverDashColor: paletteColorNumber('blue'),
      },
    },
    initialPose: BASE_POSE,
  },
  singleScreen: {
    modelUrl: '/models/single-screen.glb',
    settings: {
      ...CARD_BASE,
      halftone: {
        ...CARD_HALFTONE,
        dashColor: paletteColorNumber('blue'),
        hoverDashColor: paletteColorNumber('blue'),
      },
    },
    initialPose: BASE_POSE,
  },
  speed: {
    modelUrl: '/models/speed.glb',
    settings: {
      ...CARD_BASE,
      halftone: {
        ...CARD_HALFTONE,
        dashColor: paletteColorNumber('blue'),
        hoverDashColor: paletteColorNumber('blue'),
      },
    },
    // The loader's default bounding-sphere radius (1.6) shrunk by the
    // authored speed multiplier — the old site scaled the normalized
    // geometry by 0.731 after normalization.
    geometryOptions: { scaleTarget: 1.6 * 0.731 },
    initialPose: BASE_POSE,
  },
};
