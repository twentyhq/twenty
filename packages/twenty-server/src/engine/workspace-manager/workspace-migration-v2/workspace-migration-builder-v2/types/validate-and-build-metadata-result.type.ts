import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { type FailedFlatObjectMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-object-metadata/types/failed-flat-object-metadata-validation.type';
import { type WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

export type ValidateAndBuildMetadataResult<
  T extends WorkspaceMigrationActionV2,
> = {
  failed: (
    | FailedFlatObjectMetadataValidationExceptions
    | FailedFlatObjectMetadataValidationExceptions
  )[];
  successful: T[];
  optimisticFlatObjectMetadataMaps: FlatObjectMetadataMaps;
};
