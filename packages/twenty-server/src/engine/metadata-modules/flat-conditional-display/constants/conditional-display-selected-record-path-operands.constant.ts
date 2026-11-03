import { ViewFilterOperand } from 'twenty-shared/types';

export const CONDITIONAL_DISPLAY_SELECTED_RECORD_PATH_OPERANDS = [
  ViewFilterOperand.IS,
  ViewFilterOperand.IS_NOT,
  ViewFilterOperand.IS_EMPTY,
  ViewFilterOperand.IS_NOT_EMPTY,
  ViewFilterOperand.CONTAINS,
  ViewFilterOperand.DOES_NOT_CONTAIN,
  ViewFilterOperand.GREATER_THAN_OR_EQUAL,
  ViewFilterOperand.LESS_THAN_OR_EQUAL,
] as const;
