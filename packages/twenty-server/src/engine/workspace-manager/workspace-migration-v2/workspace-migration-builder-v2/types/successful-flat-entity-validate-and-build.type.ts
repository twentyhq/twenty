import {
  AllMetadataName,
  MetadataFlatEntityMaps,
  MetadataRelatedFlatEntityMaps,
  MetadataWorkspaceMigrationActionsRecord,
} from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { Arrayable } from 'twenty-shared/types';

export type SuccessfulFlatEntityValidateAndBuild<T extends AllMetadataName> = {
  status: 'success';
  actions: Arrayable<MetadataWorkspaceMigrationActionsRecord<T>>;
  optimisticFlatEntityMaps: MetadataFlatEntityMaps<T>;
  dependencyOptimisticFlatEntityMaps: MetadataRelatedFlatEntityMaps<T>;
};
