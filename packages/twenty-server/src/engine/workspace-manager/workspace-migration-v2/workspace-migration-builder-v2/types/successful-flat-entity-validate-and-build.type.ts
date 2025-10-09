import { AllFlatEntities } from "src/engine/metadata-modules/flat-entity/types/all-flat-entities.type";
import { AllFlatEntityMaps } from "src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type";
import { FlatEntityMaps } from "src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type";
import { CreatedDeletedUpdatedActions } from "src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/created-deleted-updated-actions.type";
import { WorkspaceMigrationActionV2 } from "src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2";

    export type SuccessfulFlatEntityValidateAndBuild<
      TActions extends WorkspaceMigrationActionV2,
      TFlatEntity extends AllFlatEntities,
      TRelatedFlatEntityMaps extends
        | Partial<AllFlatEntityMaps>
        | undefined = undefined,
    > = {
      status: 'success';
      actions: CreatedDeletedUpdatedActions<TActions>;
      optimisticFlatEntityMaps: FlatEntityMaps<TFlatEntity>;
      dependencyOptimisticFlatEntityMaps: TRelatedFlatEntityMaps;
    };