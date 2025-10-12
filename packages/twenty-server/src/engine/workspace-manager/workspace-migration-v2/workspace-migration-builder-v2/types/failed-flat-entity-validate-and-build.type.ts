import {
    type MetadataFlatEntity,
    type MetadataFlatEntityMaps,
    type MetadataValidationRelatedFlatEntityMaps,
} from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export type FailedFlatEntityValidateAndBuild<T extends AllMetadataName> = {
  status: 'fail';
  errors: FailedFlatEntityValidation<MetadataFlatEntity<T>>[];
  optimisticFlatEntityMaps: MetadataFlatEntityMaps<T>;
  dependencyOptimisticFlatEntityMaps: MetadataValidationRelatedFlatEntityMaps<T>;
};
