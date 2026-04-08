import type * as THREE from 'three';

export type HalftoneTabId = 'design' | 'prototype' | 'export';

export type HalftoneAnimationMode =
  | 'none'
  | 'autoRotate'
  | 'followHover'
  | 'followDrag';

export type HalftoneRotateAxis = 'x' | 'y' | 'z' | 'xy';

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
  mode: HalftoneAnimationMode;
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
  rotateSpeed: number;
  rotatePingPong: boolean;
}

export interface HalftoneStudioSettings {
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
  | { type: 'setShapeKey'; value: string }
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
