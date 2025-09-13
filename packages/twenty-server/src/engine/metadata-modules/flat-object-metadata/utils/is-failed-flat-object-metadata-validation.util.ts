import { FlatEntity } from 'src/engine/core-modules/common/types/flat-entity.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import {
  WORKSPACE_MIGRATION_OBJECT_ACTION_TYPES,
  type WorkspaceMigrationObjectActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';

export const isFailedFlatObjectMetadataValidation = (
  failedValidation: FailedFlatEntityValidation<FlatEntity>,
): failedValidation is FailedFlatEntityValidation<FlatObjectMetadata> => {
  return WORKSPACE_MIGRATION_OBJECT_ACTION_TYPES.includes(
    failedValidation.type as WorkspaceMigrationObjectActionTypeV2,
  );
};
