import { ViewFilterOperand, ViewFilterOperandDeprecated } from '@/types';

const operandMapping: Record<string, ViewFilterOperand> = {
  [ViewFilterOperandDeprecated.Is]: ViewFilterOperand.IS,
  [ViewFilterOperandDeprecated.IsNotNull]: ViewFilterOperand.IS_NOT_NULL,
  [ViewFilterOperandDeprecated.IsNot]: ViewFilterOperand.IS_NOT,
  [ViewFilterOperandDeprecated.LessThanOrEqual]:
    ViewFilterOperand.LESS_THAN_OR_EQUAL,
  [ViewFilterOperandDeprecated.GreaterThanOrEqual]:
    ViewFilterOperand.GREATER_THAN_OR_EQUAL,
  [ViewFilterOperandDeprecated.IsBefore]: ViewFilterOperand.IS_BEFORE,
  [ViewFilterOperandDeprecated.IsAfter]: ViewFilterOperand.IS_AFTER,
  [ViewFilterOperandDeprecated.Contains]: ViewFilterOperand.CONTAINS,
  [ViewFilterOperandDeprecated.DoesNotContain]:
    ViewFilterOperand.DOES_NOT_CONTAIN,
  [ViewFilterOperandDeprecated.IsEmpty]: ViewFilterOperand.IS_EMPTY,
  [ViewFilterOperandDeprecated.IsNotEmpty]: ViewFilterOperand.IS_NOT_EMPTY,
  [ViewFilterOperandDeprecated.IsRelative]: ViewFilterOperand.IS_RELATIVE,
  [ViewFilterOperandDeprecated.IsInPast]: ViewFilterOperand.IS_IN_PAST,
  [ViewFilterOperandDeprecated.IsInFuture]: ViewFilterOperand.IS_IN_FUTURE,
  [ViewFilterOperandDeprecated.IsToday]: ViewFilterOperand.IS_TODAY,
  [ViewFilterOperand.IS]: ViewFilterOperand.IS,
  [ViewFilterOperand.IS_NOT_NULL]: ViewFilterOperand.IS_NOT_NULL,
  [ViewFilterOperand.IS_NOT]: ViewFilterOperand.IS_NOT,
  [ViewFilterOperand.LESS_THAN_OR_EQUAL]: ViewFilterOperand.LESS_THAN_OR_EQUAL,
  [ViewFilterOperand.GREATER_THAN_OR_EQUAL]:
    ViewFilterOperand.GREATER_THAN_OR_EQUAL,
  [ViewFilterOperand.IS_BEFORE]: ViewFilterOperand.IS_BEFORE,
  [ViewFilterOperand.IS_AFTER]: ViewFilterOperand.IS_AFTER,
  [ViewFilterOperand.CONTAINS]: ViewFilterOperand.CONTAINS,
  [ViewFilterOperand.DOES_NOT_CONTAIN]: ViewFilterOperand.DOES_NOT_CONTAIN,
  [ViewFilterOperand.IS_EMPTY]: ViewFilterOperand.IS_EMPTY,
  [ViewFilterOperand.IS_NOT_EMPTY]: ViewFilterOperand.IS_NOT_EMPTY,
  [ViewFilterOperand.IS_RELATIVE]: ViewFilterOperand.IS_RELATIVE,
  [ViewFilterOperand.IS_IN_PAST]: ViewFilterOperand.IS_IN_PAST,
  [ViewFilterOperand.IS_IN_FUTURE]: ViewFilterOperand.IS_IN_FUTURE,
  [ViewFilterOperand.IS_TODAY]: ViewFilterOperand.IS_TODAY,
  [ViewFilterOperand.VECTOR_SEARCH]: ViewFilterOperand.VECTOR_SEARCH,
};

export const convertViewFilterOperandToCoreOperand = (
  sharedOperand: string,
): ViewFilterOperand => {
  return operandMapping[sharedOperand];
};
