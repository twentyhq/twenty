import { type FailedFlatObjectMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-object-metadata/types/failed-flat-object-metadata-validation.type';
import { type WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

export type FailedAndSuccessfulMetadataValidateAndBuildRecord<
  T extends WorkspaceMigrationActionV2 = WorkspaceMigrationActionV2,
> = {
  failed: (
    | FailedFlatObjectMetadataValidationExceptions
    | FailedFlatObjectMetadataValidationExceptions
  )[];
  successful: T[];
};
