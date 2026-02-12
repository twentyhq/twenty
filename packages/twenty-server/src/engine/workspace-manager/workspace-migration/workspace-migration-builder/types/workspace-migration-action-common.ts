import { type AllMetadataName } from 'twenty-shared/metadata';

import {
  type MetadataFlatWorkspaceMigrationAction,
  type MetadataUniversalWorkspaceMigrationAction,
  type WorkspaceMigrationActionType,
} from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';

export type AllUniversalWorkspaceMigrationAction<
  TActionType extends
    WorkspaceMigrationActionType = WorkspaceMigrationActionType,
  TMetadataName extends AllMetadataName = AllMetadataName,
> = MetadataUniversalWorkspaceMigrationAction<TMetadataName, TActionType>;

export type AllFlatWorkspaceMigrationAction<
  TActionType extends
    WorkspaceMigrationActionType = WorkspaceMigrationActionType,
  TMetadataName extends AllMetadataName = AllMetadataName,
> = MetadataFlatWorkspaceMigrationAction<TMetadataName, TActionType>;

export { WorkspaceMigrationActionType };

export type WorkspaceMigrationActionHandlerKey =
  `${WorkspaceMigrationActionType}_${AllMetadataName}`;

export const buildActionHandlerKey = (
  actionType: WorkspaceMigrationActionType,
  metadataName: AllMetadataName,
): WorkspaceMigrationActionHandlerKey => `${actionType}_${metadataName}`;
