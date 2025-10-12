import {
    type MetadataFlatEntityMaps,
    type MetadataValidationRelatedFlatEntityMaps,
    type MetadataWorkspaceMigrationActionsRecord,
} from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';

export type SuccessfulFlatEntityValidateAndBuild<T extends AllMetadataName> = {
  status: 'success';
  actions: MetadataWorkspaceMigrationActionsRecord<T>;
  optimisticFlatEntityMaps: MetadataFlatEntityMaps<T>;
  dependencyOptimisticFlatEntityMaps: MetadataValidationRelatedFlatEntityMaps<T>;
};
