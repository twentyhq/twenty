import {
    type MetadataFlatEntity,
    type MetadataValidationRelatedFlatEntityMaps,
    type MetadataWorkspaceMigrationAction,
} from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export type FlatEntityValidationReturnType<
  T extends AllMetadataName,
  TOperation extends 'created' | 'deleted' | 'updated',
> =
  | {
      status: 'success';
      action:
        | MetadataWorkspaceMigrationAction<T, TOperation>
        | MetadataWorkspaceMigrationAction<T, TOperation>[];
      dependencyOptimisticFlatEntityMaps: MetadataValidationRelatedFlatEntityMaps<T>;
    }
  | ({
      status: 'fail';
    } & FailedFlatEntityValidation<MetadataFlatEntity<T>>);
