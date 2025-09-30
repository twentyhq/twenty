import { ViewFilterOperand } from 'twenty-shared/types';

const operandMapping: Record<string, ViewFilterOperand> = {
  Is: ViewFilterOperand.IS,
  IsNotNull: ViewFilterOperand.IS_NOT_NULL,
  IsNot: ViewFilterOperand.IS_NOT,
  LessThanOrEqual: ViewFilterOperand.LESS_THAN_OR_EQUAL,
  GreaterThanOrEqual: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
  IsBefore: ViewFilterOperand.IS_BEFORE,
  IsAfter: ViewFilterOperand.IS_AFTER,
  Contains: ViewFilterOperand.CONTAINS,
  DoesNotContain: ViewFilterOperand.DOES_NOT_CONTAIN,
  IsEmpty: ViewFilterOperand.IS_EMPTY,
  IsNotEmpty: ViewFilterOperand.IS_NOT_EMPTY,
  IsRelative: ViewFilterOperand.IS_RELATIVE,
  IsInPast: ViewFilterOperand.IS_IN_PAST,
  IsInFuture: ViewFilterOperand.IS_IN_FUTURE,
  IsToday: ViewFilterOperand.IS_TODAY,
  VectorSearch: ViewFilterOperand.VECTOR_SEARCH,
};

export const convertViewFilterOperandToCoreOperand = (
  sharedOperand: string,
): ViewFilterOperand => {
  return operandMapping[sharedOperand];
};
