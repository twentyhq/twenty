'use client';

import {
  DEFAULT_GLASS_ANIMATION_SETTINGS,
  DEFAULT_GLASS_BACKGROUND_SETTINGS,
  DEFAULT_GLASS_MATERIAL_SETTINGS,
  DEFAULT_SHAPE_HALFTONE_SETTINGS,
  DEFAULT_SOLID_ANIMATION_SETTINGS,
  DEFAULT_SOLID_BACKGROUND_SETTINGS,
  DEFAULT_SOLID_MATERIAL_SETTINGS,
  HalftoneModelCanvas,
  type HalftoneExportPose,
  type HalftoneMaterialSurface,
  type HalftoneStudioSettings,
  type HalftoneToneTarget,
} from '@/lib/halftone';

type HalftoneRotateAxis = 'x' | 'y' | 'z' | 'xy' | '-x' | '-y' | '-z' | '-xy';
type HalftoneRotatePreset = 'axis' | 'lissajous' | 'orbit' | 'tumble';

export type HelpedHalftonePose = HalftoneExportPose;

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

type HelpedHalftoneModelProps = {
  initialPose: HelpedHalftonePose;
  label: string;
  modelUrl: string;
  previewDistance: number;
  settings: HelpedHalftoneSettings;
};

function getMaterialSurface(
  settings: HelpedHalftoneSettings,
): HalftoneMaterialSurface {
  return settings.material.surface === 'glass' ? 'glass' : 'solid';
}

function createStudioSettings(
  settings: HelpedHalftoneSettings,
): HalftoneStudioSettings {
  const surface = getMaterialSurface(settings);
  const defaultMaterial =
    surface === 'glass'
      ? DEFAULT_GLASS_MATERIAL_SETTINGS
      : DEFAULT_SOLID_MATERIAL_SETTINGS;
  const defaultAnimation =
    surface === 'glass'
      ? DEFAULT_GLASS_ANIMATION_SETTINGS
      : DEFAULT_SOLID_ANIMATION_SETTINGS;
  const defaultBackground =
    surface === 'glass'
      ? DEFAULT_GLASS_BACKGROUND_SETTINGS
      : DEFAULT_SOLID_BACKGROUND_SETTINGS;

  return {
    sourceMode: 'shape',
    shapeKey: 'helped',
    lighting: { ...settings.lighting },
    material: {
      ...defaultMaterial,
      ...settings.material,
      surface,
    },
    halftone: {
      ...DEFAULT_SHAPE_HALFTONE_SETTINGS,
      ...settings.halftone,
      toneTarget:
        settings.halftone.toneTarget ??
        DEFAULT_SHAPE_HALFTONE_SETTINGS.toneTarget,
      hoverDashColor:
        settings.halftone.hoverDashColor ?? settings.halftone.dashColor,
      imageContrast:
        settings.halftone.imageContrast ??
        DEFAULT_SHAPE_HALFTONE_SETTINGS.imageContrast,
    },
    background: defaultBackground,
    animation: {
      ...defaultAnimation,
      ...settings.animation,
    },
  };
}

export function HelpedHalftoneModel({
  initialPose,
  label,
  modelUrl,
  previewDistance,
  settings,
}: HelpedHalftoneModelProps) {
  return (
    <HalftoneModelCanvas
      initialPose={initialPose}
      modelLabel={label}
      modelUrl={modelUrl}
      previewDistance={previewDistance}
      renderStrategy="static"
      settings={createStudioSettings(settings)}
    />
  );
}
