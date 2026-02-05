import { type AllMetadataName } from 'twenty-shared/metadata';

import {
  type MetadataUniversalWorkspaceMigrationAction,
  type WorkspaceMigrationActionType,
} from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export type UniversalFlatEntityValidationReturnType<
  TMetadataName extends AllMetadataName,
  TACtionType extends WorkspaceMigrationActionType,
> =
  | {
      status: 'success';
      action: MetadataUniversalWorkspaceMigrationAction<
        TMetadataName,
        TACtionType
      >;
    }
  | ({
      status: 'fail';
    } & FailedFlatEntityValidation<TMetadataName, TACtionType>);
