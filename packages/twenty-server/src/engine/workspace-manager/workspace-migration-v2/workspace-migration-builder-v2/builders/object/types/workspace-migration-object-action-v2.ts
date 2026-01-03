import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type BaseCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/base-create-workspace-migration-action.type';
import { type BaseDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/base-delete-workspace-migration-action.type';
import { type BaseUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/base-update-workspace-migration-action.type';

export type CreateObjectAction =
  BaseCreateWorkspaceMigrationAction<'objectMetadata'> & {
    flatFieldMetadatas: FlatFieldMetadata[];
  };

export type UpdateObjectAction =
  BaseUpdateWorkspaceMigrationAction<'objectMetadata'>;

export type DeleteObjectAction =
  BaseDeleteWorkspaceMigrationAction<'objectMetadata'>;

export type WorkspaceMigrationObjectActionV2 =
  | CreateObjectAction
  | UpdateObjectAction
  | DeleteObjectAction;

export type WorkspaceMigrationObjectActionTypeV2 =
  WorkspaceMigrationObjectActionV2['type'];

export const WORKSPACE_MIGRATION_OBJECT_ACTION_TYPES = [
  'create',
  'delete',
  'update',
] as const satisfies WorkspaceMigrationObjectActionTypeV2[];
