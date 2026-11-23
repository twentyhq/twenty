/* @license Enterprise */

import { isNonEmptyString } from '@sniptt/guards';
import {
  type RowLevelPermissionPredicate,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isRlsPredicateAtRootConjunction } from 'src/engine/permissions/internal/rls/utils/is-rls-predicate-at-root-conjunction.util';
import { type RlsRule } from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';

const isRlsLiteralValuesPredicate = (
  predicate: RowLevelPermissionPredicate,
): predicate is RowLevelPermissionPredicate & { value: string[] } =>
  !isDefined(predicate.workspaceMemberFieldMetadataId) &&
  predicate.operand === RowLevelPermissionPredicateOperand.IS &&
  Array.isArray(predicate.value) &&
  predicate.value.every(isNonEmptyString);

export const findRlsRuleSplitPredicate = ({
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
    .filter((predicate) =>
      isRlsPredicateAtRootConjunction({ predicate, predicateGroups }),
    );

  return literalValuePredicates.length === 1 ? literalValuePredicates[0] : null;
};
