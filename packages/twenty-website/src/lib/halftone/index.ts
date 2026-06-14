export {
  HalftoneCanvas,
  type HalftoneImageInteractionSettings,
  type HalftoneRenderStrategy,
  type HalftoneSnapshotFn,
} from './components/HalftoneCanvas';
export { HalftoneImageCanvas } from './components/HalftoneImageCanvas';
export { HalftoneModelCanvas } from './components/HalftoneModelCanvas';

export {
  createFallbackGeometry,
  loadImportedGeometryFromUrl,
  type ImportedGeometryNormalizationOptions,
} from './utils/geometry-registry';

export {
  DEFAULT_GLASS_ANIMATION_SETTINGS,
  DEFAULT_GLASS_BACKGROUND_SETTINGS,
  DEFAULT_GLASS_LIGHTING_SETTINGS,
  DEFAULT_GLASS_MATERIAL_SETTINGS,
  DEFAULT_HALFTONE_SETTINGS,
  DEFAULT_IMAGE_HALFTONE_SETTINGS,
  DEFAULT_SHAPE_HALFTONE_SETTINGS,
  DEFAULT_SOLID_ANIMATION_SETTINGS,
  DEFAULT_SOLID_BACKGROUND_SETTINGS,
  DEFAULT_SOLID_LIGHTING_SETTINGS,
  DEFAULT_SOLID_MATERIAL_SETTINGS,
  normalizeHalftoneStudioSettings,
} from './utils/state';

export type {
  HalftoneAnimationSettings,
  HalftoneBackgroundSettings,
  HalftoneEffectSettings,
  HalftoneExportPose,
  HalftoneGeometrySpec,
  HalftoneLightingSettings,
  HalftoneMaterialSettings,
  HalftoneMaterialSurface,
  HalftoneStudioSettings,
  HalftoneStudioSettingsOverrides,
  HalftoneToneTarget,
} from './utils/state';

export {
  getContainedImageRect,
  getImageFootprintScale,
  getImagePreviewZoom,
  getMeshFootprintScale,
  type HalftoneImageFit,
  REFERENCE_PREVIEW_DISTANCE,
  VIRTUAL_RENDER_HEIGHT,
} from './utils/footprint';

export { HALFTONE_FOOTPRINT_RUNTIME_SOURCE } from './generated/footprint-runtime-source';
