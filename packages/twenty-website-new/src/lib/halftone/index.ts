export {
  HalftoneCanvas,
  type HalftoneImageInteractionSettings,
  type HalftoneSnapshotFn,
} from './halftone-canvas';
export { HalftoneImageCanvas } from './halftone-image-canvas';
export { HalftoneModelCanvas } from './halftone-model-canvas';

export {
  createFallbackGeometry,
  loadImportedGeometryFromUrl,
  type ImportedGeometryNormalizationOptions,
} from './geometry-registry';

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
} from './state';

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
} from './state';

export {
  getContainedImageRect,
  getImageFootprintScale,
  getImagePreviewZoom,
  getMeshFootprintScale,
  type HalftoneImageFit,
  HALFTONE_FOOTPRINT_RUNTIME_SOURCE,
  REFERENCE_PREVIEW_DISTANCE,
  VIRTUAL_RENDER_HEIGHT,
} from './footprint';
