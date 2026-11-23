import { ViewFilterOperand } from 'twenty-shared/types';

export const ROLLUP_TIME_DEPENDENT_FILTER_OPERANDS: ViewFilterOperand[] = [
  ViewFilterOperand.IS_RELATIVE,
  ViewFilterOperand.IS_IN_PAST,
  ViewFilterOperand.IS_IN_FUTURE,
  ViewFilterOperand.IS_TODAY,
];
