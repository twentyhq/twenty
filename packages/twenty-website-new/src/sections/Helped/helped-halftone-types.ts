import type {
  HalftoneExportPose,
  HalftoneMaterialSurface,
  HalftoneToneTarget,
} from '@/lib/halftone';

type HalftoneRotateAxis = 'x' | 'y' | 'z' | 'xy' | '-x' | '-y' | '-z' | '-xy';
type HalftoneRotatePreset = 'axis' | 'lissajous' | 'orbit' | 'tumble';

export type HelpedHalftonePose = HalftoneExportPose;

export const HELPED_BASE_SETTINGS: Omit<HelpedHalftoneSettings, 'halftone'> = {
  lighting: {
    intensity: 3,
    fillIntensity: 0,
    ambientIntensity: 0,
    angleDegrees: 47,
    height: 1.4,
  },
  material: {
    surface: 'glass',
    color: '#7d7d7d',
    roughness: 0.26,
    metalness: 0.15,
    thickness: 15.58,
    refraction: 3,
    environmentPower: 5,
  },
  animation: {
    autoRotateEnabled: false,
    breatheEnabled: true,
    cameraParallaxEnabled: false,
    followHoverEnabled: false,
    followDragEnabled: true,
    floatEnabled: false,
    hoverLightEnabled: false,
    dragFlowEnabled: false,
    lightSweepEnabled: false,
    rotateEnabled: false,
    autoSpeed: 0.15,
    autoWobble: 0.3,
    breatheAmount: 0.015,
    breatheSpeed: 0.25,
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
    rotateSpeed: 0.1,
    rotatePingPong: false,
    floatAmplitude: 0.16,
    floatSpeed: 0.8,
    lightSweepHeightRange: 0,
    lightSweepRange: 28,
    lightSweepSpeed: 0.25,
    springDamping: 0.5,
    springReturnEnabled: true,
    springStrength: 0.1,
    hoverHalftoneEnabled: false,
    hoverHalftonePowerShift: 0.42,
    hoverHalftoneRadius: 0.2,
    hoverHalftoneWidthShift: -0.18,
    hoverLightIntensity: 0.8,
    hoverLightRadius: 0.2,
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
};

export type HelpedHalftoneSettings = {
  lighting: {
    intensity: number;
    fillIntensity: number;
    ambientIntensity: number;
    angleDegrees: number;
    height: number;
  };
  material: {
    roughness: number;
    metalness: number;
    surface?: HalftoneMaterialSurface;
    color?: string;
    thickness?: number;
    refraction?: number;
    environmentPower?: number;
  };
  halftone: {
    enabled: boolean;
    scale: number;
    power: number;
    toneTarget?: HalftoneToneTarget;
    width: number;
    imageContrast?: number;
    dashColor: string;
    hoverDashColor?: string;
  };
  animation: {
    autoRotateEnabled: boolean;
    breatheEnabled: boolean;
    cameraParallaxEnabled: boolean;
    followHoverEnabled: boolean;
    followDragEnabled: boolean;
    floatEnabled: boolean;
    hoverLightEnabled: boolean;
    dragFlowEnabled: boolean;
    lightSweepEnabled: boolean;
    rotateEnabled: boolean;
    autoSpeed: number;
    autoWobble: number;
    breatheAmount: number;
    breatheSpeed: number;
    cameraParallaxAmount: number;
    cameraParallaxEase: number;
    driftAmount: number;
    hoverRange: number;
    hoverEase: number;
    hoverReturn: boolean;
    dragSens: number;
    dragFriction: number;
    dragMomentum: boolean;
    rotateAxis: HalftoneRotateAxis;
    rotatePreset: HalftoneRotatePreset;
    rotateSpeed: number;
    rotatePingPong: boolean;
    floatAmplitude: number;
    floatSpeed: number;
    lightSweepHeightRange: number;
    lightSweepRange: number;
    lightSweepSpeed: number;
    springDamping: number;
    springReturnEnabled: boolean;
    springStrength: number;
    hoverHalftoneEnabled?: boolean;
    hoverHalftonePowerShift?: number;
    hoverHalftoneRadius?: number;
    hoverHalftoneWidthShift?: number;
    hoverLightIntensity: number;
    hoverLightRadius: number;
    dragFlowDecay: number;
    dragFlowRadius: number;
    dragFlowStrength: number;
    hoverWarpStrength: number;
    hoverWarpRadius: number;
    dragWarpStrength: number;
    waveEnabled: boolean;
    waveSpeed: number;
    waveAmount: number;
  };
};
