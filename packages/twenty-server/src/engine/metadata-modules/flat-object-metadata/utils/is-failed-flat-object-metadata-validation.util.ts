import { FailedFlatFieldMetadataValidation } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { FailedFlatObjectMetadataValidation } from 'src/engine/metadata-modules/flat-object-metadata/types/failed-flat-object-metadata-validation.type';
import {
  WORKSPACE_MIGRATION_OBJECT_ACTION_TYPES,
  WorkspaceMigrationObjectActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';

export const isFailedFlatObjectMetadataValidation = (
  failedValidation:
    | FailedFlatObjectMetadataValidation
    | FailedFlatFieldMetadataValidation,
): failedValidation is FailedFlatObjectMetadataValidation => {
  return WORKSPACE_MIGRATION_OBJECT_ACTION_TYPES.includes(
    failedValidation.type as WorkspaceMigrationObjectActionTypeV2,
  );
};
