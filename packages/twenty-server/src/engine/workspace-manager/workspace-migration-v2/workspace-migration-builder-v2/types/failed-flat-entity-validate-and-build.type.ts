import { MetadataFlatEntity, MetadataFlatEntityMaps, MetadataRelatedFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export type FailedFlatEntityValidateAndBuild<
  T extends AllMetadataName,
> = {
  status: 'fail';
  errors: FailedFlatEntityValidation<MetadataFlatEntity<T>>[];
  optimisticFlatEntityMaps: MetadataFlatEntityMaps<T>;
  dependencyOptimisticFlatEntityMaps: MetadataRelatedFlatEntityMaps<T>;
};
