// The halftone studio's settings vocabulary (ported from the old
// lib/halftone state model; interfaces → types per the redone convention).

export type HalftoneTabId = 'design' | 'animations' | 'export';
export type HalftoneSourceMode = 'shape' | 'image';
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
export type HalftoneModelLoader = 'fbx' | 'glb';

export type HalftoneLightingSettings = {
  intensity: number;
  fillIntensity: number;
  ambientIntensity: number;
  angleDegrees: number;
  height: number;
};

export type HalftoneMaterialSettings = {
  surface: HalftoneMaterialSurface;
  color: string;
  roughness: number;
  metalness: number;
  thickness: number;
  refraction: number;
  environmentPower: number;
};

export type HalftoneEffectSettings = {
  enabled: boolean;
  scale: number;
  power: number;
  toneTarget: HalftoneToneTarget;
  width: number;
  imageContrast: number;
  dashColor: string;
  hoverDashColor: string;
};

export type HalftoneBackgroundSettings = {
  transparent: boolean;
  color: string;
};

export type HalftoneAnimationSettings = {
  autoRotateEnabled: boolean;
  breatheEnabled: boolean;
  cameraParallaxEnabled: boolean;
  followHoverEnabled: boolean;
  followDragEnabled: boolean;
  floatEnabled: boolean;
  hoverHalftoneEnabled: boolean;
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
  hoverHalftonePowerShift: number;
  hoverHalftoneRadius: number;
  hoverHalftoneWidthShift: number;
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

export type HalftoneStudioSettings = {
  sourceMode: HalftoneSourceMode;
  shapeKey: string;
  lighting: HalftoneLightingSettings;
  material: HalftoneMaterialSettings;
  halftone: HalftoneEffectSettings;
  background: HalftoneBackgroundSettings;
  animation: HalftoneAnimationSettings;
};

export type HalftoneStudioSettingsOverrides = Partial<
  Omit<
    HalftoneStudioSettings,
    'lighting' | 'material' | 'halftone' | 'background' | 'animation'
  >
> & {
  lighting?: Partial<HalftoneLightingSettings>;
  material?: Partial<HalftoneMaterialSettings>;
  halftone?: Partial<HalftoneEffectSettings>;
  background?: Partial<HalftoneBackgroundSettings>;
  animation?: Partial<HalftoneAnimationSettings>;
};

export type HalftoneGeometrySpec = {
  key: string;
  label: string;
  kind: 'builtin' | 'imported';
  loader?: HalftoneModelLoader;
  filename?: string;
  description?: string;
  extensions?: readonly string[];
  userProvided?: boolean;
};

export type HalftoneStudioState = {
  activeTab: HalftoneTabId;
  geometrySpecs: HalftoneGeometrySpec[];
  importedFiles: Record<string, File>;
  settings: HalftoneStudioSettings;
  showHint: boolean;
  statusMessage: string;
  statusIsError: boolean;
};

export type HalftoneExportPose = {
  autoElapsed: number;
  rotateElapsed: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  targetRotationX: number;
  targetRotationY: number;
  timeElapsed: number;
};

export type HalftoneStudioAction =
  | { type: 'setTab'; value: HalftoneTabId }
  | { type: 'setSourceMode'; value: HalftoneSourceMode }
  | { type: 'setShapeKey'; value: string }
  | { type: 'replaceSettings'; value: HalftoneStudioSettings }
  | { type: 'patchLighting'; value: Partial<HalftoneLightingSettings> }
  | { type: 'patchMaterial'; value: Partial<HalftoneMaterialSettings> }
  | { type: 'patchHalftone'; value: Partial<HalftoneEffectSettings> }
  | { type: 'patchBackground'; value: Partial<HalftoneBackgroundSettings> }
  | { type: 'patchAnimation'; value: Partial<HalftoneAnimationSettings> }
  | {
      type: 'registerImportedFile';
      spec: HalftoneGeometrySpec;
      file: File;
      activate: boolean;
    }
  | { type: 'setStatus'; message: string; isError?: boolean }
  | { type: 'clearStatus' }
  | { type: 'hideHint' };
