export type HalftoneMaterialSurface = 'solid' | 'glass';
export type HalftoneToneTarget = 'light' | 'dark';
export type HalftoneRotateAxis =
  | 'x'
  | 'y'
  | 'z'
  | 'xy'
  | '-x'
  | '-y'
  | '-z'
  | '-xy';
export type HalftoneRotatePreset = 'axis' | 'lissajous' | 'orbit' | 'tumble';

export type HalftoneLightingSettings = {
  intensity: number;
  fillIntensity: number;
  ambientIntensity: number;
  angleDegrees: number;
  height: number;
};

// Colors are numeric (0x...) throughout the heavy zone; CSS strings only
// exist at the rig boundary where tokens resolve.
export type HalftoneMaterialSettings = {
  surface: HalftoneMaterialSurface;
  color: number;
  roughness: number;
  metalness: number;
  thickness: number;
  refraction: number;
  environmentPower: number;
};

// The band shader (studio era: tiled dashes, hover shifts) and the legacy
// row shader (the hourglass's authored look) are both first-class.
export type HalftoneBandEffectSettings = {
  variant: 'band';
  enabled: boolean;
  scale: number;
  power: number;
  toneTarget: HalftoneToneTarget;
  width: number;
  dashColor: number;
  hoverDashColor: number;
};

export type HalftoneRowEffectSettings = {
  variant: 'rows';
  enabled: boolean;
  numRows: number;
  glowStrength: number;
  contrast: number;
  power: number;
  shading: number;
  baseInk: number;
  maxBar: number;
  rowMerge: number;
  cellRatio: number;
  cutoff: number;
  highlightOpen: number;
  shadowGrouping: number;
  shadowCrush: number;
  dashColor: number;
};

export type HalftoneEffectSettings =
  | HalftoneBandEffectSettings
  | HalftoneRowEffectSettings;

export type HalftoneAnimationSettings = {
  autoRotateEnabled: boolean;
  breatheEnabled: boolean;
  breatheAmount: number;
  breatheSpeed: number;
  floatEnabled: boolean;
  floatAmplitude: number;
  floatSpeed: number;
  driftAmount: number;
  cameraParallaxEnabled: boolean;
  cameraParallaxAmount: number;
  cameraParallaxEase: number;
  lightSweepEnabled: boolean;
  lightSweepRange: number;
  lightSweepHeightRange: number;
  lightSweepSpeed: number;
  followHoverEnabled: boolean;
  followDragEnabled: boolean;
  hoverHalftoneEnabled: boolean;
  hoverLightEnabled: boolean;
  dragFlowEnabled: boolean;
  rotateEnabled: boolean;
  autoSpeed: number;
  autoWobble: number;
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
  springDamping: number;
  springReturnEnabled: boolean;
  springStrength: number;
  hoverHalftonePowerShift: number;
  hoverHalftoneRadius: number;
  hoverHalftoneWidthShift: number;
  hoverLightIntensity: number;
  hoverLightRadius: number;
  dragFlowDecay: number;
  dragFlowRadius: number;
  dragFlowStrength: number;
  waveEnabled: boolean;
  waveSpeed: number;
  waveAmount: number;
};

export type HalftoneSceneSettings = {
  previewDistance: number;
  lighting: HalftoneLightingSettings;
  material: HalftoneMaterialSettings;
  halftone: HalftoneEffectSettings;
  animation: HalftoneAnimationSettings;
};

export type HalftoneSceneSettingsOverrides = {
  previewDistance?: number;
  lighting?: Partial<HalftoneLightingSettings>;
  material?: Partial<HalftoneMaterialSettings>;
  halftone?:
    | ({ variant: 'band' } & Partial<
        Omit<HalftoneBandEffectSettings, 'variant'>
      >)
    | ({ variant: 'rows' } & Partial<
        Omit<HalftoneRowEffectSettings, 'variant'>
      >);
  animation?: Partial<HalftoneAnimationSettings>;
};

const DEFAULT_PREVIEW_DISTANCE = 4;

const DEFAULT_SOLID_LIGHTING: HalftoneLightingSettings = {
  intensity: 1.5,
  fillIntensity: 0.15,
  ambientIntensity: 0.08,
  angleDegrees: 45,
  height: 2,
};

const DEFAULT_GLASS_LIGHTING: HalftoneLightingSettings = {
  intensity: 3,
  fillIntensity: 0,
  ambientIntensity: 0.3,
  angleDegrees: 53,
  height: 2,
};

const DEFAULT_SOLID_MATERIAL: HalftoneMaterialSettings = {
  surface: 'solid',
  color: 0xd4d0c8,
  roughness: 0.42,
  metalness: 0.16,
  thickness: 150,
  refraction: 2,
  environmentPower: 5,
};

const DEFAULT_GLASS_MATERIAL: HalftoneMaterialSettings = {
  surface: 'glass',
  color: 0x7d7d7d,
  roughness: 0,
  metalness: 0,
  thickness: 15.58,
  refraction: 2,
  environmentPower: 5,
};

const DEFAULT_BAND_HALFTONE: HalftoneBandEffectSettings = {
  variant: 'band',
  enabled: true,
  scale: 24.72,
  power: -0.07,
  toneTarget: 'light',
  width: 0.46,
  dashColor: 0x4a38f5,
  hoverDashColor: 0x4a38f5,
};

const DEFAULT_ROW_HALFTONE: HalftoneRowEffectSettings = {
  variant: 'rows',
  enabled: true,
  numRows: 150,
  glowStrength: 0,
  contrast: 1.2,
  power: 1.1,
  shading: 3,
  baseInk: 0.19,
  maxBar: 0.35,
  rowMerge: 0.08,
  cellRatio: 2.2,
  cutoff: 0.02,
  highlightOpen: 0.04,
  shadowGrouping: 0.18,
  shadowCrush: 0.14,
  dashColor: 0x4a38f5,
};

const DEFAULT_SOLID_ANIMATION: HalftoneAnimationSettings = {
  autoRotateEnabled: true,
  breatheEnabled: false,
  breatheAmount: 0.04,
  breatheSpeed: 0.8,
  floatEnabled: false,
  floatAmplitude: 0.16,
  floatSpeed: 0.8,
  driftAmount: 8,
  cameraParallaxEnabled: false,
  cameraParallaxAmount: 0.3,
  cameraParallaxEase: 0.08,
  lightSweepEnabled: false,
  lightSweepRange: 28,
  lightSweepHeightRange: 0.5,
  lightSweepSpeed: 0.7,
  followHoverEnabled: false,
  followDragEnabled: false,
  hoverHalftoneEnabled: false,
  hoverLightEnabled: false,
  dragFlowEnabled: false,
  rotateEnabled: false,
  autoSpeed: 0.2,
  autoWobble: 0.3,
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
  springDamping: 0.72,
  springReturnEnabled: false,
  springStrength: 0.18,
  hoverHalftonePowerShift: 0.42,
  hoverHalftoneRadius: 0.2,
  hoverHalftoneWidthShift: -0.18,
  hoverLightIntensity: 0.8,
  hoverLightRadius: 0.2,
  dragFlowDecay: 0.08,
  dragFlowRadius: 0.24,
  dragFlowStrength: 1.8,
  waveEnabled: false,
  waveSpeed: 1,
  waveAmount: 2,
};

const DEFAULT_GLASS_ANIMATION: HalftoneAnimationSettings = {
  ...DEFAULT_SOLID_ANIMATION,
  followDragEnabled: true,
  autoSpeed: 0.15,
  rotateSpeed: 0.1,
};

export function resolveHalftoneSettings(
  overrides: HalftoneSceneSettingsOverrides = {},
): HalftoneSceneSettings {
  const surface: HalftoneMaterialSurface =
    overrides.material?.surface === 'glass' ? 'glass' : 'solid';
  const materialDefaults =
    surface === 'glass' ? DEFAULT_GLASS_MATERIAL : DEFAULT_SOLID_MATERIAL;
  const lightingDefaults =
    surface === 'glass' ? DEFAULT_GLASS_LIGHTING : DEFAULT_SOLID_LIGHTING;
  const animationDefaults =
    surface === 'glass' ? DEFAULT_GLASS_ANIMATION : DEFAULT_SOLID_ANIMATION;

  const halftone: HalftoneEffectSettings =
    overrides.halftone?.variant === 'rows'
      ? { ...DEFAULT_ROW_HALFTONE, ...overrides.halftone }
      : { ...DEFAULT_BAND_HALFTONE, ...overrides.halftone, variant: 'band' };

  return {
    previewDistance: overrides.previewDistance ?? DEFAULT_PREVIEW_DISTANCE,
    lighting: { ...lightingDefaults, ...overrides.lighting },
    material: { ...materialDefaults, ...overrides.material, surface },
    halftone,
    animation: { ...animationDefaults, ...overrides.animation },
  };
}
