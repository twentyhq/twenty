import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import { type FlatRowLevelPermissionRule } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-rule.type';

export type RowLevelPermissionUpsertOperations = {
  rulesToCreate: FlatRowLevelPermissionRule[];
  rulesToUpdate: FlatRowLevelPermissionRule[];
  rulesToDelete: FlatRowLevelPermissionRule[];
  fieldPermissionsToUpdate: FlatFieldPermission[];
  predicatesToCreate: FlatRowLevelPermissionPredicate[];
  predicatesToUpdate: FlatRowLevelPermissionPredicate[];
  predicatesToDelete: FlatRowLevelPermissionPredicate[];
  groupsToCreate: FlatRowLevelPermissionPredicateGroup[];
  groupsToUpdate: FlatRowLevelPermissionPredicateGroup[];
  groupsToDelete: FlatRowLevelPermissionPredicateGroup[];
};
