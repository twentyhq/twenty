import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
    WORKSPACE_MIGRATION_OBJECT_ACTION_TYPES,
    type WorkspaceMigrationObjectActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/types/workspace-migration-object-action-v2';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export const isFailedFlatObjectMetadataValidation = (
  failedValidation: FailedFlatEntityValidation<SyncableFlatEntity>,
): failedValidation is FailedFlatEntityValidation<FlatObjectMetadata> => {
  return WORKSPACE_MIGRATION_OBJECT_ACTION_TYPES.includes(
    failedValidation.type as WorkspaceMigrationObjectActionTypeV2,
  );
};
