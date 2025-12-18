/* @license Enterprise */

import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';

export type CreateRowLevelPermissionPredicateGroupAction = {
  type: 'create_row_level_permission_predicate_group';
  rowLevelPermissionPredicateGroup: FlatRowLevelPermissionPredicateGroup;
};

export type UpdateRowLevelPermissionPredicateGroupAction = {
  type: 'update_row_level_permission_predicate_group';
  rowLevelPermissionPredicateGroupId: string;
  updates: FlatEntityPropertiesUpdates<'rowLevelPermissionPredicateGroup'>;
};

export type DeleteRowLevelPermissionPredicateGroupAction = {
  type: 'delete_row_level_permission_predicate_group';
  rowLevelPermissionPredicateGroupId: string;
};

export type WorkspaceMigrationRowLevelPermissionPredicateGroupActionV2 =
  | CreateRowLevelPermissionPredicateGroupAction
  | UpdateRowLevelPermissionPredicateGroupAction
  | DeleteRowLevelPermissionPredicateGroupAction;

export type WorkspaceMigrationRowLevelPermissionPredicateGroupActionTypeV2 =
  WorkspaceMigrationRowLevelPermissionPredicateGroupActionV2['type'];
