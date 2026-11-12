import {
  type FilterableAndTSVectorFieldType,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

// Filter types whose operands take one value: a member list is compared value by value
export const SINGLE_VALUE_FILTER_TYPES: FilterableAndTSVectorFieldType[] = [
  'TEXT',
  'NUMBER',
];

export const MATCHING_ANY_MEMBER_VALUE_OPERANDS: RowLevelPermissionPredicateOperand[] =
  [
    RowLevelPermissionPredicateOperand.IS,
    RowLevelPermissionPredicateOperand.CONTAINS,
  ];

export const MATCHING_NO_MEMBER_VALUE_OPERANDS: RowLevelPermissionPredicateOperand[] =
  [
    RowLevelPermissionPredicateOperand.IS_NOT,
    RowLevelPermissionPredicateOperand.DOES_NOT_CONTAIN,
  ];
