import type { HalftoneMaterialTextureImage } from '../engine/material-texture-image';
import type {
  HalftoneExportPose,
  HalftoneGeometrySpec,
  HalftoneStudioSettings,
} from '../engine/studio-settings-types';

export type ReactExportSettings = {
  includeNamedAndDefaultExport: boolean;
  includePublicAssetUrl: boolean;
  includeRegistryComment: boolean;
  includeTsNoCheck: boolean;
  includeUseClientDirective: boolean;
  includeStyledMount: boolean;
};

export type HalftoneMaterialExportImages = {
  environment: string;
  textures: Partial<Record<HalftoneMaterialTextureImage, string>>;
};

export type ReactExportOptions = {
  assetUrl?: string;
  background?: string;
  exportSettings?: Partial<ReactExportSettings>;
  imageFilename?: string;
  importedFile?: File;
  initialPose?: HalftoneExportPose;
  materialImages?: HalftoneMaterialExportImages;
  modelFilenameOverride?: string;
  previewDistance?: number;
};

export const DEFAULT_REACT_EXPORT_SETTINGS: ReactExportSettings = {
  includeNamedAndDefaultExport: true,
  includePublicAssetUrl: true,
  includeRegistryComment: true,
  includeTsNoCheck: true,
  includeUseClientDirective: true,
  includeStyledMount: true,
};

export type ExportedShapeDescriptor = {
  filename: string | null;
  key: string;
  kind: HalftoneGeometrySpec['kind'];
  label: string;
  loader: HalftoneGeometrySpec['loader'] | null;
};

export type ParsedExportedPreset = {
  componentName: string | null;
  imageAssetReference: string | null;
  initialPose: HalftoneExportPose;
  modelAssetReference: string | null;
  previewDistance: number;
  settings: HalftoneStudioSettings;
  shape: ExportedShapeDescriptor;
};
