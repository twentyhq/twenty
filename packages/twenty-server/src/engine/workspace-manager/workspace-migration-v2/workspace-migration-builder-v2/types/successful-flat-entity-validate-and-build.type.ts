import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { type MetadataValidationRelatedFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { type MetadataWorkspaceMigrationActionsRecord } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';

export type SuccessfulFlatEntityValidateAndBuild<T extends AllMetadataName> = {
  status: 'success';
  actions: MetadataWorkspaceMigrationActionsRecord<T>;
  optimisticFlatEntityMaps: MetadataFlatEntityMaps<T>;
  dependencyOptimisticFlatEntityMaps: MetadataValidationRelatedFlatEntityMaps<T>;
};
