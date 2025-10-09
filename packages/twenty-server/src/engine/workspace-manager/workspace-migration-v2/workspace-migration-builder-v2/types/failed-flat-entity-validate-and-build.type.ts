import { AllFlatEntities } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities.type';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export type FailedFlatEntityValidateAndBuild<
  TFlatEntity extends AllFlatEntities,
  TRelatedFlatEntityMaps extends
    | Partial<AllFlatEntityMaps>
    | undefined = undefined,
> = {
  status: 'fail';
  errors: FailedFlatEntityValidation<TFlatEntity>[];
  optimisticFlatEntityMaps: FlatEntityMaps<TFlatEntity>;
  dependencyOptimisticFlatEntityMaps: TRelatedFlatEntityMaps;
};
