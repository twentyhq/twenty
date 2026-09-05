/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';

export type RoleFlatRowLevelPermissionPredicate =
  FlatRowLevelPermissionPredicate & { roleId: string };

export type RoleFlatRowLevelPermissionPredicateGroup =
  FlatRowLevelPermissionPredicateGroup & { roleId: string };

export const isRoleFlatRowLevelPermissionPredicate = <
  TPredicate extends { roleId: string | null },
>(
  flatPredicate: TPredicate | undefined,
): flatPredicate is TPredicate & { roleId: string } =>
  isDefined(flatPredicate) && isDefined(flatPredicate.roleId);

export const isRoleFlatRowLevelPermissionPredicateGroup = <
  TPredicateGroup extends { roleId: string | null },
>(
  flatGroup: TPredicateGroup | undefined,
): flatGroup is TPredicateGroup & { roleId: string } =>
  isDefined(flatGroup) && isDefined(flatGroup.roleId);
