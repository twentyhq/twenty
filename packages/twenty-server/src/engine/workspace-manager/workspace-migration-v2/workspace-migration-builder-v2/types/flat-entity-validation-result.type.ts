import { AllFlatEntities } from "src/engine/metadata-modules/flat-entity/types/all-flat-entities.type";
import { AllFlatEntityMaps } from "src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type";
import { FailedFlatEntityValidation } from "src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type";
import { WorkspaceMigrationActionV2 } from "src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2";

export type FlatEntityValidationReturnType<
  TActions extends WorkspaceMigrationActionV2,
  TFlatEntity extends AllFlatEntities,
  TRelatedFlatEntityMaps extends
    | Partial<AllFlatEntityMaps>
    | undefined = undefined,
> =
  | {
      status: 'success';
      action: TActions | TActions[];
      dependencyOptimisticFlatEntityMaps: TRelatedFlatEntityMaps;
    }
  | ({
      status: 'fail';
    } & FailedFlatEntityValidation<TFlatEntity>);
