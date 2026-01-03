import { type BaseCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/base-create-workspace-migration-action.type';
import { type BaseDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/base-delete-workspace-migration-action.type';
import { type BaseUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/base-update-workspace-migration-action.type';

export type CreateViewFilterGroupAction =
  BaseCreateWorkspaceMigrationAction<'viewFilterGroup'>;

export type UpdateViewFilterGroupAction =
  BaseUpdateWorkspaceMigrationAction<'viewFilterGroup'>;

export type DeleteViewFilterGroupAction =
  BaseDeleteWorkspaceMigrationAction<'viewFilterGroup'>;

export type WorkspaceMigrationViewFilterGroupActionV2 =
  | CreateViewFilterGroupAction
  | UpdateViewFilterGroupAction
  | DeleteViewFilterGroupAction;

export type WorkspaceMigrationViewFilterGroupActionTypeV2 =
  WorkspaceMigrationViewFilterGroupActionV2['type'];
