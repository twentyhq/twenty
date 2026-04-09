import type * as THREE from 'three';

export type HalftoneTabId = 'design' | 'animations' | 'export';

export type HalftoneSourceMode = 'shape' | 'image';

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

export interface HalftoneLightingSettings {
  intensity: number;
  fillIntensity: number;
  ambientIntensity: number;
  angleDegrees: number;
  height: number;
}

export interface HalftoneMaterialSettings {
  roughness: number;
  metalness: number;
}

export interface HalftoneEffectSettings {
  enabled: boolean;
  numRows: number;
  contrast: number;
  power: number;
  shading: number;
  baseInk: number;
  maxBar: number;
  cellRatio: number;
  cutoff: number;
  dashColor: string;
}

export interface HalftoneBackgroundSettings {
  transparent: boolean;
  color: string;
}

export interface HalftoneAnimationSettings {
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
}

export interface HalftoneExportPose {
  autoElapsed: number;
  rotateElapsed: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  targetRotationX: number;
  targetRotationY: number;
  timeElapsed: number;
}

export interface HalftoneStudioSettings {
  sourceMode: HalftoneSourceMode;
  shapeKey: string;
  lighting: HalftoneLightingSettings;
  material: HalftoneMaterialSettings;
  halftone: HalftoneEffectSettings;
  background: HalftoneBackgroundSettings;
  animation: HalftoneAnimationSettings;
}

export interface HalftoneGeometrySpec {
  key: string;
  label: string;
  kind: 'builtin' | 'imported';
  loader?: HalftoneModelLoader;
  filename?: string;
  description?: string;
  extensions?: readonly string[];
  userProvided?: boolean;
}

export interface HalftoneStudioState {
  activeTab: HalftoneTabId;
  geometrySpecs: HalftoneGeometrySpec[];
  importedFiles: Record<string, File>;
  settings: HalftoneStudioSettings;
  showHint: boolean;
  statusMessage: string;
  statusIsError: boolean;
}

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
  | { type: 'setImportedFile'; key: string; file: File }
  | { type: 'setStatus'; message: string; isError?: boolean }
  | { type: 'clearStatus' }
  | { type: 'hideHint' };

export type GeometryCacheEntry =
  | THREE.BufferGeometry
  | Promise<THREE.BufferGeometry>;
