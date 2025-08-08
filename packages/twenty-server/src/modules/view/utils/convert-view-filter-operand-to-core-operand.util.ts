import { ViewFilterOperand as SharedViewFilterOperand } from 'twenty-shared/types';

import { ViewFilterOperand } from 'src/engine/core-modules/view/enums/view-filter-operand';

const operandMapping: Record<SharedViewFilterOperand, ViewFilterOperand> = {
  [SharedViewFilterOperand.Is]: ViewFilterOperand.IS,
  [SharedViewFilterOperand.IsNotNull]: ViewFilterOperand.IS_NOT_NULL,
  [SharedViewFilterOperand.IsNot]: ViewFilterOperand.IS_NOT,
  [SharedViewFilterOperand.LessThanOrEqual]:
    ViewFilterOperand.LESS_THAN_OR_EQUAL,
  [SharedViewFilterOperand.GreaterThanOrEqual]:
    ViewFilterOperand.GREATER_THAN_OR_EQUAL,
  [SharedViewFilterOperand.IsBefore]: ViewFilterOperand.IS_BEFORE,
  [SharedViewFilterOperand.IsAfter]: ViewFilterOperand.IS_AFTER,
  [SharedViewFilterOperand.Contains]: ViewFilterOperand.CONTAINS,
  [SharedViewFilterOperand.DoesNotContain]: ViewFilterOperand.DOES_NOT_CONTAIN,
  [SharedViewFilterOperand.IsEmpty]: ViewFilterOperand.IS_EMPTY,
  [SharedViewFilterOperand.IsNotEmpty]: ViewFilterOperand.IS_NOT_EMPTY,
  [SharedViewFilterOperand.IsRelative]: ViewFilterOperand.IS_RELATIVE,
  [SharedViewFilterOperand.IsInPast]: ViewFilterOperand.IS_IN_PAST,
  [SharedViewFilterOperand.IsInFuture]: ViewFilterOperand.IS_IN_FUTURE,
  [SharedViewFilterOperand.IsToday]: ViewFilterOperand.IS_TODAY,
  [SharedViewFilterOperand.VectorSearch]: ViewFilterOperand.VECTOR_SEARCH,
};

export const convertViewFilterOperandToCoreOperand = (
  sharedOperand: SharedViewFilterOperand,
): ViewFilterOperand => {
  return operandMapping[sharedOperand];
};
