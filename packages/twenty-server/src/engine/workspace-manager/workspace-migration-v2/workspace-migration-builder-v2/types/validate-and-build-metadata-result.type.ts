import { type FlatEntity } from 'src/engine/core-modules/common/types/flat-entity.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

export type ValidateAndBuildMetadataResult<
  T extends WorkspaceMigrationActionV2,
> = {
  failed: FailedFlatEntityValidation<FlatEntity>[];
  created: T[];
  deleted: T[];
  updated: T[];
  optimisticFlatObjectMetadataMaps: FlatObjectMetadataMaps;
};
