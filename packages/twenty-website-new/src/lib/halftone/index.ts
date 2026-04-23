/**
 * Public surface of the halftone runtime — the bits sections may depend on.
 *
 * Studio-only modules (`app/halftone/_lib/exporters`, `share`, `formatters`,
 * `imageSvgExport`, `glassEnvironmentData`, `exportNames`) and the studio
 * components stay in `app/halftone/` because no section needs them.
 *
 * Sections should prefer this barrel over deep imports — the deep modules
 * are not part of the supported API and may be reorganised.
 */
export { HalftoneCanvas } from './halftone-canvas';

export { loadImportedGeometryFromUrl } from './geometry-registry';

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
  HalftoneToneTarget,
} from './state';

export {
  getContainedImageRect,
  getImageFootprintScale,
  getImagePreviewZoom,
  getMeshFootprintScale,
  HALFTONE_FOOTPRINT_RUNTIME_SOURCE,
  REFERENCE_PREVIEW_DISTANCE,
  VIRTUAL_RENDER_HEIGHT,
} from './footprint';
