import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataFlatEntityAndRelatedFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { type MetadataWorkspaceMigrationActionsRecord } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';

export type SuccessfulFlatEntityValidateAndBuild<T extends AllMetadataName> = {
  status: 'success';
  actions: MetadataWorkspaceMigrationActionsRecord<T>;
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: MetadataFlatEntityAndRelatedFlatEntityMaps<T>;
};
