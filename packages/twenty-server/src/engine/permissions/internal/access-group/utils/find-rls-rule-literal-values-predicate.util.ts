/* @license Enterprise */

import { isNonEmptyString } from '@sniptt/guards';
import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RlsRule } from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';

const isAtRootConjunction = ({
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

const isRlsLiteralValuesPredicate = (
  predicate: RowLevelPermissionPredicate,
): predicate is RowLevelPermissionPredicate & { value: string[] } =>
  !isDefined(predicate.workspaceMemberFieldMetadataId) &&
  predicate.operand === RowLevelPermissionPredicateOperand.IS &&
  Array.isArray(predicate.value) &&
  predicate.value.every(isNonEmptyString);

export const findRlsRuleLiteralValuesPredicate = ({
  predicates,
  predicateGroups,
}: Pick<RlsRule, 'predicates' | 'predicateGroups'>):
  | (RowLevelPermissionPredicate & { value: string[] })
  | null => {
  if (
    predicates.some(({ workspaceMemberFieldMetadataId }) =>
      isDefined(workspaceMemberFieldMetadataId),
    )
  ) {
    return null;
  }

  const literalValuePredicates = predicates
    .filter(isRlsLiteralValuesPredicate)
    .filter((predicate) => isAtRootConjunction({ predicate, predicateGroups }));

  return literalValuePredicates.length === 1 ? literalValuePredicates[0] : null;
};
