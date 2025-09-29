import { ViewFilterOperand as RecordFilterOperand } from '@/types';
import { isDefined } from '@/utils';
import { isEmptinessOperand, type RecordFilter } from '@/utils/filter';

type CheckIfShouldSkipFilteringParams = {
  recordFilter: Pick<RecordFilter, 'operand' | 'value'>;
};

export const checkIfShouldSkipFiltering = ({
  recordFilter,
}: CheckIfShouldSkipFilteringParams) => {
  const isAnEmptinessOperand = isEmptinessOperand(recordFilter.operand);

  const isDateOperandWithoutValue = [
    RecordFilterOperand.IsInPast,
    RecordFilterOperand.IsInFuture,
    RecordFilterOperand.IsToday,
  ].includes(recordFilter.operand);

  const isFilterValueEmpty =
    !isDefined(recordFilter.value) || recordFilter.value === '';

  const shouldSkipFiltering =
    !isAnEmptinessOperand && !isDateOperandWithoutValue && isFilterValueEmpty;

  return shouldSkipFiltering;
};
