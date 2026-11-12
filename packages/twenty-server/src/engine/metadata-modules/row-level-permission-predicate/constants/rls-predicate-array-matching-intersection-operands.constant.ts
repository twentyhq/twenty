import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';

export const RLS_PREDICATE_ARRAY_MATCHING_INTERSECTION_OPERANDS: RowLevelPermissionPredicateOperand[] =
  [
    RowLevelPermissionPredicateOperand.IS_NOT,
    RowLevelPermissionPredicateOperand.DOES_NOT_CONTAIN,
  ];
