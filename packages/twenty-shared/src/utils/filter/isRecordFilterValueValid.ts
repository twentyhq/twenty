import { ViewFilterOperand } from '@/types';
import { isDefined } from '@/utils';

import { isRecordFilterOperandExpectingValue } from './isRecordFilterOperandExpectingValue';

import { parseRecordFilterBetweenValue } from './parseRecordFilterBetweenValue';

export const isRecordFilterValueValid = (recordFilter: {
  operand: ViewFilterOperand;
  value: string;
}): boolean => {
  if (!isRecordFilterOperandExpectingValue(recordFilter.operand)) {
    return true;
  }

  if (recordFilter.operand === ViewFilterOperand.IS_BETWEEN) {
    if (!isDefined(recordFilter.value) || recordFilter.value === '') {
      return false;
    }
    const { startValue, endValue } = parseRecordFilterBetweenValue(
      recordFilter.value,
    );
    return startValue !== '' && endValue !== '';
  }

  return (
    isDefined(recordFilter.value) &&
    recordFilter.value !== '' &&
    recordFilter.value !== '[]'
  );
};
