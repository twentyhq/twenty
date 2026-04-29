import {
  normalizeHalftoneStudioSettings,
  type HalftoneExportPose,
  type HalftoneImageFit,
  type HalftoneStudioSettings,
  type HalftoneStudioSettingsOverrides,
} from '@/lib/halftone';

export type MilestoneSettingsOverrides = HalftoneStudioSettingsOverrides;

export const MILESTONE_IMAGE_URL = '/illustrations/generated/milestone.jpg';
export const MILESTONE_IMAGE_FIT: HalftoneImageFit = 'cover';
export const MILESTONE_PREVIEW_DISTANCE = 4;

export const MILESTONE_INITIAL_POSE: HalftoneExportPose = {
  autoElapsed: 0,
  rotateElapsed: 0,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  targetRotationX: 0,
  targetRotationY: 0,
  timeElapsed: 33.42220000023842,
};

const BASE_MILESTONE_SETTINGS = normalizeHalftoneStudioSettings({
  sourceMode: 'image',
  shapeKey: 'torusKnot',
  lighting: {
    intensity: 1.5,
    fillIntensity: 0.15,
    ambientIntensity: 0.08,
    angleDegrees: 45,
    height: 2,
  },
  material: {
    surface: 'solid',
    color: '#d4d0c8',
    roughness: 0.42,
    metalness: 0.16,
    thickness: 150,
    refraction: 2,
    environmentPower: 5,
  },
  halftone: {
    enabled: true,
    scale: 22,
    power: -0.07,
    toneTarget: 'light',
    width: 0.46,
    imageContrast: 1,
    dashColor: '#F3F3F3',
    hoverDashColor: '#F3F3F3',
  },
  background: {
    transparent: false,
    color: '#4A38F5',
  },
  animation: {
    autoRotateEnabled: true,
    breatheEnabled: false,
    cameraParallaxEnabled: false,
    followHoverEnabled: false,
    followDragEnabled: false,
    floatEnabled: false,
    hoverHalftoneEnabled: false,
    hoverLightEnabled: true,
    dragFlowEnabled: false,
    lightSweepEnabled: false,
    rotateEnabled: false,
    autoSpeed: 0.2,
    autoWobble: 0.3,
    breatheAmount: 0.04,
    breatheSpeed: 0.8,
    cameraParallaxAmount: 0.3,
    cameraParallaxEase: 0.08,
    driftAmount: 8,
    hoverRange: 25,
    hoverEase: 0.08,
    hoverReturn: true,
    dragSens: 0.008,
    dragFriction: 0.08,
    dragMomentum: true,
    rotateAxis: 'y',
    rotatePreset: 'axis',
    rotateSpeed: 0.2,
    rotatePingPong: false,
    floatAmplitude: 0.16,
    floatSpeed: 0.8,
    lightSweepHeightRange: 0.5,
    lightSweepRange: 28,
    lightSweepSpeed: 0.7,
    springDamping: 0.72,
    springReturnEnabled: false,
    springStrength: 0.18,
    hoverHalftonePowerShift: 0.42,
    hoverHalftoneRadius: 0.2,
    hoverHalftoneWidthShift: -0.18,
    hoverLightIntensity: 1.2,
    hoverLightRadius: 0.45,
    dragFlowDecay: 0.08,
    dragFlowRadius: 0.24,
    dragFlowStrength: 1.8,
    hoverWarpStrength: 3,
    hoverWarpRadius: 0.15,
    dragWarpStrength: 5,
    waveEnabled: false,
    waveSpeed: 1,
    waveAmount: 2,
  },
});

export const buildMilestoneSettings = (
  overrides?: MilestoneSettingsOverrides,
): HalftoneStudioSettings =>
  normalizeHalftoneStudioSettings({
    ...BASE_MILESTONE_SETTINGS,
    ...overrides,
    animation: {
      ...BASE_MILESTONE_SETTINGS.animation,
      ...overrides?.animation,
    },
    background: {
      ...BASE_MILESTONE_SETTINGS.background,
      ...overrides?.background,
    },
    halftone: {
      ...BASE_MILESTONE_SETTINGS.halftone,
      ...overrides?.halftone,
    },
    lighting: {
      ...BASE_MILESTONE_SETTINGS.lighting,
      ...overrides?.lighting,
    },
    material: {
      ...BASE_MILESTONE_SETTINGS.material,
      ...overrides?.material,
    },
  });
