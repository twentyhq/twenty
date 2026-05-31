import { ViewFilterOperand } from '@/types';
import { isDefined } from '@/utils';

import { isRecordFilterOperandExpectingValue } from './isRecordFilterOperandExpectingValue';

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
    const commaIndex = recordFilter.value.indexOf(',');
    if (commaIndex === -1) return false;
    const minPart = recordFilter.value.slice(0, commaIndex);
    const maxPart = recordFilter.value.slice(commaIndex + 1);
    return (
      minPart !== '' &&
      maxPart !== '' &&
      !isNaN(parseFloat(minPart)) &&
      !isNaN(parseFloat(maxPart))
    );
  }

  return (
    isDefined(recordFilter.value) &&
    recordFilter.value !== '' &&
    recordFilter.value !== '[]'
  );
};
