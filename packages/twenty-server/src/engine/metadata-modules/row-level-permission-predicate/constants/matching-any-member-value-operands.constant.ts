import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';

export const MATCHING_ANY_MEMBER_VALUE_OPERANDS: RowLevelPermissionPredicateOperand[] =
  [
    RowLevelPermissionPredicateOperand.IS,
    RowLevelPermissionPredicateOperand.CONTAINS,
  ];
