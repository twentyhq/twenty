import { ViewFilterOperand } from 'twenty-shared/types';
import { isDefined, isRecordFilterValueValid } from 'twenty-shared/utils';

const EMPTINESS_OPERAND_BY_OPERAND: Partial<
  Record<ViewFilterOperand, ViewFilterOperand>
> = {
  [ViewFilterOperand.IS]: ViewFilterOperand.IS_EMPTY,
  [ViewFilterOperand.IS_NOT]: ViewFilterOperand.IS_NOT_EMPTY,
  [ViewFilterOperand.CONTAINS]: ViewFilterOperand.IS_EMPTY,
  [ViewFilterOperand.DOES_NOT_CONTAIN]: ViewFilterOperand.IS_NOT_EMPTY,
};

export const turnEmptyFilterValuesIntoEmptinessOperands = <
  TRecordFilter extends { operand: ViewFilterOperand; value: string },
>(
  recordFilters: TRecordFilter[],
): TRecordFilter[] =>
  recordFilters.map((recordFilter) => {
    if (isRecordFilterValueValid(recordFilter)) {
      return recordFilter;
    }

    const emptinessOperand = EMPTINESS_OPERAND_BY_OPERAND[recordFilter.operand];

    return isDefined(emptinessOperand)
      ? { ...recordFilter, operand: emptinessOperand }
      : recordFilter;
  });
