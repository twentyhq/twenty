/* @license Enterprise */

import { isNonEmptyString } from '@sniptt/guards';
import {
  RowLevelPermissionPredicateOperand,
  type RowLevelRecordsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AccessGroupSharedPredicate } from 'src/engine/permissions/internal/access-group/types/access-group-shared-predicate.type';

export const findRlsRuleSharedPredicateValues = (
  rowLevelPermissionRule: Pick<
    RowLevelRecordsPermissions,
    'predicates' | 'predicateGroups'
  >,
):
  | {
      sharedPredicate: Omit<
        AccessGroupSharedPredicate,
        'value' | 'unreadableFieldIds'
      >;
      values: string[];
    }
  | undefined => {
  const { predicates, predicateGroups } = rowLevelPermissionRule;
  const [predicate] = predicates;

  if (
    predicates.length !== 1 ||
    predicateGroups.length > 1 ||
    !isDefined(predicate) ||
    isDefined(predicate.workspaceMemberFieldMetadataId) ||
    predicate.operand !== RowLevelPermissionPredicateOperand.IS ||
    !Array.isArray(predicate.value) ||
    !predicate.value.every(isNonEmptyString)
  ) {
    return undefined;
  }

  return {
    sharedPredicate: {
      objectMetadataId: predicate.objectMetadataId,
      relationFieldMetadataId: predicate.relationFieldMetadataId ?? null,
      fieldMetadataId: predicate.fieldMetadataId,
      subFieldName: predicate.subFieldName ?? null,
      operand: predicate.operand,
    },
    values: [...new Set(predicate.value)],
  };
};
