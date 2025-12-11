import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';

export type CreateRowLevelPermissionPredicateAction = {
  type: 'create_row_level_permission_predicate';
  rowLevelPermissionPredicate: FlatRowLevelPermissionPredicate;
};

export type UpdateRowLevelPermissionPredicateAction = {
  type: 'update_row_level_permission_predicate';
  rowLevelPermissionPredicateId: string;
  updates: FlatEntityPropertiesUpdates<'rowLevelPermissionPredicate'>;
};

export type DeleteRowLevelPermissionPredicateAction = {
  type: 'delete_row_level_permission_predicate';
  rowLevelPermissionPredicateId: string;
};

export type DestroyRowLevelPermissionPredicateAction = {
  type: 'destroy_row_level_permission_predicate';
  rowLevelPermissionPredicateId: string;
};

export type WorkspaceMigrationRowLevelPermissionPredicateActionV2 =
  | CreateRowLevelPermissionPredicateAction
  | UpdateRowLevelPermissionPredicateAction
  | DeleteRowLevelPermissionPredicateAction
  | DestroyRowLevelPermissionPredicateAction;

export type WorkspaceMigrationRowLevelPermissionPredicateActionTypeV2 =
  WorkspaceMigrationRowLevelPermissionPredicateActionV2['type'];
