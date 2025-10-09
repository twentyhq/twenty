import { AllFlatEntities } from "src/engine/metadata-modules/flat-entity/types/all-flat-entities.type";
import { AllFlatEntityMaps } from "src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type";
import { FlatEntityMaps } from "src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type";
import { WorkspaceMigrationBuilderOptions } from "src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-builder-options.type";

export type FlatEntityValidationArgs<
  TFlatEntity extends AllFlatEntities,
  TRelatedFlatEntityMaps extends
    | Partial<AllFlatEntityMaps>
    | undefined = undefined,
> = {
  flatEntityToValidate: TFlatEntity;
  optimisticFlatEntityMaps: FlatEntityMaps<TFlatEntity>;
  dependencyOptimisticFlatEntityMaps: TRelatedFlatEntityMaps;
  workspaceId: string;
  remainingFlatEntityMapsToValidate: FlatEntityMaps<TFlatEntity>;
  buildOptions: WorkspaceMigrationBuilderOptions;
};
