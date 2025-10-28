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
    RecordFilterOperand.IS_IN_PAST,
    RecordFilterOperand.IS_IN_FUTURE,
    RecordFilterOperand.IS_TODAY,
  ].includes(recordFilter.operand);

  const isFilterValueEmpty =
    !isDefined(recordFilter.value) || recordFilter.value === '';

  const shouldSkipFiltering =
    !isAnEmptinessOperand && !isDateOperandWithoutValue && isFilterValueEmpty;

  return shouldSkipFiltering;
};
