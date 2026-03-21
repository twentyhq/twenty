import { type ViewFilterOperand } from '@/types';

import { isRecordFilterValueValid } from './isRecordFilterValueValid';

type CheckIfShouldSkipFilteringParams = {
  recordFilter: { operand: ViewFilterOperand; value: string };
};

export const checkIfShouldSkipFiltering = ({
  recordFilter,
}: CheckIfShouldSkipFilteringParams) => {
  return !isRecordFilterValueValid(recordFilter);
};
