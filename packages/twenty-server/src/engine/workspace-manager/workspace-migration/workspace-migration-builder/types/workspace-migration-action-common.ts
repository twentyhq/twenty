import { type AllMetadataName } from 'twenty-shared/metadata';

import {
  type MetadataWorkspaceMigrationAction,
  type WorkspaceMigrationActionType,
} from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';

export type WorkspaceMigrationAction = MetadataWorkspaceMigrationAction<
  AllMetadataName,
  WorkspaceMigrationActionType
>;

export { WorkspaceMigrationActionType };

export type WorkspaceMigrationActionHandlerKey =
  `${WorkspaceMigrationActionType}_${AllMetadataName}`;

export const buildActionHandlerKey = (
  actionType: WorkspaceMigrationActionType,
  metadataName: AllMetadataName,
): WorkspaceMigrationActionHandlerKey => `${actionType}_${metadataName}`;
