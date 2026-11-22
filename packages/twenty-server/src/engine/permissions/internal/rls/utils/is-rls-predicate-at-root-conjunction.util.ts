/* @license Enterprise */

import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isRlsPredicateAtRootConjunction = ({
  predicate,
  predicateGroups,
}: {
  predicate: Pick<
    RowLevelPermissionPredicate,
    'rowLevelPermissionPredicateGroupId'
  >;
  predicateGroups: Pick<
    RowLevelPermissionPredicateGroup,
    'id' | 'logicalOperator' | 'parentRowLevelPermissionPredicateGroupId'
  >[];
}): boolean => {
  let groupId = predicate.rowLevelPermissionPredicateGroupId ?? null;

  while (isDefined(groupId)) {
    const predicateGroup = predicateGroups.find(({ id }) => id === groupId);

    if (
      !isDefined(predicateGroup) ||
      predicateGroup.logicalOperator !==
        RowLevelPermissionPredicateGroupLogicalOperator.AND
    ) {
      return false;
    }

    groupId = predicateGroup.parentRowLevelPermissionPredicateGroupId ?? null;
  }

  return true;
};
