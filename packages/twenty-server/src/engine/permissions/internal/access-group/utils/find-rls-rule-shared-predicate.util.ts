/* @license Enterprise */

import { isNonEmptyString } from '@sniptt/guards';
import {
  type RowLevelPermissionPredicate,
  RowLevelPermissionPredicateOperand,
  type RowLevelRecordsPermissions,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const SHARED_PREDICATE_MEMBER_FIELD_KEY = 'sharedPredicate';

export type RlsRuleSharedPredicate = Pick<
  RowLevelPermissionPredicate,
  | 'fieldMetadataId'
  | 'relationFieldMetadataId'
  | 'objectMetadataId'
  | 'operand'
  | 'subFieldName'
> & { values: string[] };

// A rule made of one "is any of these values" predicate reaches the same records as one rule per value,
// so its groups can be keyed by value and shared by every role listing that value
export const findRlsRuleSharedPredicate = (
  rowLevelPermissionRule: Pick<
    RowLevelRecordsPermissions,
    'predicates' | 'predicateGroups'
  >,
): RlsRuleSharedPredicate | undefined => {
  const [predicate, ...otherPredicates] = rowLevelPermissionRule.predicates;

  if (
    !isDefined(predicate) ||
    isNonEmptyArray(otherPredicates) ||
    rowLevelPermissionRule.predicateGroups.length > 1 ||
    isDefined(predicate.workspaceMemberFieldMetadataId) ||
    predicate.operand !== RowLevelPermissionPredicateOperand.IS ||
    !Array.isArray(predicate.value) ||
    !predicate.value.every(isNonEmptyString)
  ) {
    return undefined;
  }

  return {
    fieldMetadataId: predicate.fieldMetadataId,
    relationFieldMetadataId: predicate.relationFieldMetadataId ?? null,
    objectMetadataId: predicate.objectMetadataId,
    operand: predicate.operand,
    subFieldName: predicate.subFieldName,
    values: predicate.value,
  };
};
