import type {
  HalftoneMaterialSurface,
  HalftoneToneTarget,
} from '@/lib/halftone';

type HalftoneRotateAxis = 'x' | 'y' | 'z' | 'xy' | '-x' | '-y' | '-z' | '-xy';
type HalftoneRotatePreset = 'axis' | 'lissajous' | 'orbit' | 'tumble';

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
