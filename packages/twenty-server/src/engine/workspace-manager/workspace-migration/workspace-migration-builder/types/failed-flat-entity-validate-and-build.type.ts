import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalFlatEntityAndRelatedUniversalFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { type WorkspaceMigrationActionType } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export type FailedFlatEntityValidateAndBuild<T extends AllMetadataName> = {
  status: 'fail';
  errors: FailedFlatEntityValidation<T, WorkspaceMigrationActionType>[];
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: MetadataUniversalFlatEntityAndRelatedUniversalFlatEntityMaps<T>;
};
