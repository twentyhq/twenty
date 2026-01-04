/* @license Enterprise */

import { type BaseCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/base-create-workspace-migration-action.type';
import { type BaseDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/base-delete-workspace-migration-action.type';
import { type BaseUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/base-update-workspace-migration-action.type';

export type CreateRowLevelPermissionPredicateAction =
  BaseCreateWorkspaceMigrationAction<'rowLevelPermissionPredicate'>;

export type UpdateRowLevelPermissionPredicateAction =
  BaseUpdateWorkspaceMigrationAction<'rowLevelPermissionPredicate'>;

export type DeleteRowLevelPermissionPredicateAction =
  BaseDeleteWorkspaceMigrationAction<'rowLevelPermissionPredicate'>;
