import { type ViewFilterOperand } from '@/types';

import { isRecordFilterValueValid } from './isRecordFilterValueValid';

export const filterOutInvalidRecordFilters = <
  T extends { operand: ViewFilterOperand; value: string },
>(
  recordFilters: T[],
): T[] => {
  return recordFilters.filter(isRecordFilterValueValid);
};
