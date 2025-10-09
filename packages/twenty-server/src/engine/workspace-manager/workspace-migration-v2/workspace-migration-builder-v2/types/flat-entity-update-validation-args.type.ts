import { AllFlatEntities } from "src/engine/core-modules/common/types/all-flat-entities.type";
import { AllFlatEntityMaps } from "src/engine/core-modules/common/types/all-flat-entity-maps.type";
import { FlatEntityMaps } from "src/engine/core-modules/common/types/flat-entity-maps.type";
import { FlatEntityValidationArgs } from "src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type";
import { FromTo } from "twenty-shared/types";

export type FlatEntityUpdateValidationArgs<
  TFlatEntity extends AllFlatEntities,
  TRelatedFlatEntityMaps extends
    | Partial<AllFlatEntityMaps>
    | undefined = undefined,
> = Omit<
  FlatEntityValidationArgs<TFlatEntity, TRelatedFlatEntityMaps>,
  'flatEntityToValidate' | 'remainingFlatEntityMapsToValidate'
> & {
  flatEntityUpdate: FromTo<TFlatEntity>;
  remainingFlatEntityMapsToValidate: FromTo<FlatEntityMaps<TFlatEntity>>;
};