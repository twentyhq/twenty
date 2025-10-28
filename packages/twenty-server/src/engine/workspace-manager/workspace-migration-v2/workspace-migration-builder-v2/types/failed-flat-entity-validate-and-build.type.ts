import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataValidationRelatedFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export type FailedFlatEntityValidateAndBuild<T extends AllMetadataName> = {
  status: 'fail';
  errors: FailedFlatEntityValidation<MetadataFlatEntity<T>>[];
  optimisticFlatEntityMaps: MetadataFlatEntityMaps<T>;
  dependencyOptimisticFlatEntityMaps: MetadataValidationRelatedFlatEntityMaps<T>;
};
