/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';

export type RoleFlatRowLevelPermissionPredicate =
  FlatRowLevelPermissionPredicate & { roleId: string };

export type RoleFlatRowLevelPermissionPredicateGroup =
  FlatRowLevelPermissionPredicateGroup & { roleId: string };

export const isRoleFlatRowLevelPermissionPredicate = (
  flatPredicate: FlatRowLevelPermissionPredicate | undefined,
): flatPredicate is RoleFlatRowLevelPermissionPredicate =>
  isDefined(flatPredicate) && isDefined(flatPredicate.roleId);

export const isRoleFlatRowLevelPermissionPredicateGroup = (
  flatGroup: FlatRowLevelPermissionPredicateGroup | undefined,
): flatGroup is RoleFlatRowLevelPermissionPredicateGroup =>
  isDefined(flatGroup) && isDefined(flatGroup.roleId);
