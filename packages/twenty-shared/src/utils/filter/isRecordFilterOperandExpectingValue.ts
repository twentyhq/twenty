import { ViewFilterOperand } from '@/types';

export const isRecordFilterOperandExpectingValue = (
  operand: ViewFilterOperand,
): boolean => {
  switch (operand) {
    case ViewFilterOperand.IS_NOT_NULL:
    case ViewFilterOperand.IS_EMPTY:
    case ViewFilterOperand.IS_NOT_EMPTY:
    case ViewFilterOperand.IS_IN_PAST:
    case ViewFilterOperand.IS_IN_FUTURE:
    case ViewFilterOperand.IS_TODAY:
      return false;
    default:
      return true;
  }
};
