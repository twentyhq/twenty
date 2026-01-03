/* @license Enterprise */

import { type BaseCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/base-create-workspace-migration-action.type';
import { type BaseDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/base-delete-workspace-migration-action.type';
import { type BaseUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/base-update-workspace-migration-action.type';

export type CreateRowLevelPermissionPredicateGroupAction =
  BaseCreateWorkspaceMigrationAction<'rowLevelPermissionPredicateGroup'>;

export type UpdateRowLevelPermissionPredicateGroupAction =
  BaseUpdateWorkspaceMigrationAction<'rowLevelPermissionPredicateGroup'>;

export type DeleteRowLevelPermissionPredicateGroupAction =
  BaseDeleteWorkspaceMigrationAction<'rowLevelPermissionPredicateGroup'>;

export type WorkspaceMigrationRowLevelPermissionPredicateGroupActionV2 =
  | CreateRowLevelPermissionPredicateGroupAction
  | UpdateRowLevelPermissionPredicateGroupAction
  | DeleteRowLevelPermissionPredicateGroupAction;

export type WorkspaceMigrationRowLevelPermissionPredicateGroupActionTypeV2 =
  WorkspaceMigrationRowLevelPermissionPredicateGroupActionV2['type'];
