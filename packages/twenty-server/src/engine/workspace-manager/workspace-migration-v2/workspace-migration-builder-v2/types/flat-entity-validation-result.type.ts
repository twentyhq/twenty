import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import {
  type MetadataWorkspaceMigrationAction,
  type WorkspaceMigrationActionType,
} from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export type FlatEntityValidationReturnType<
  T extends AllMetadataName,
  TACtionType extends WorkspaceMigrationActionType,
> =
  | {
      status: 'success';
      action:
        | MetadataWorkspaceMigrationAction<T, TACtionType>
        | MetadataWorkspaceMigrationAction<T, TACtionType>[];
    }
  | ({
      status: 'fail';
    } & FailedFlatEntityValidation<MetadataFlatEntity<T>>);
