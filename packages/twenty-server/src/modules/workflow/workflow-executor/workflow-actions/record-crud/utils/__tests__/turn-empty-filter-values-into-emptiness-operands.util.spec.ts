import { ViewFilterOperand } from 'twenty-shared/types';

import { turnEmptyFilterValuesIntoEmptinessOperands } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/utils/turn-empty-filter-values-into-emptiness-operands.util';

const recordFilter = (operand: ViewFilterOperand, value: string) => ({
  operand,
  value,
});

describe('turnEmptyFilterValuesIntoEmptinessOperands', () => {
  it('leaves a filter that still has a value untouched', () => {
    const recordFilters = [recordFilter(ViewFilterOperand.IS, 'acme')];

    expect(turnEmptyFilterValuesIntoEmptinessOperands(recordFilters)).toEqual(
      recordFilters,
    );
  });

  it.each([
    [ViewFilterOperand.IS, ViewFilterOperand.IS_EMPTY],
    [ViewFilterOperand.IS_NOT, ViewFilterOperand.IS_NOT_EMPTY],
    [ViewFilterOperand.CONTAINS, ViewFilterOperand.IS_EMPTY],
    [ViewFilterOperand.DOES_NOT_CONTAIN, ViewFilterOperand.IS_NOT_EMPTY],
  ])('turns %s with an empty value into %s', (operand, emptinessOperand) => {
    expect(
      turnEmptyFilterValuesIntoEmptinessOperands([recordFilter(operand, '')]),
    ).toEqual([recordFilter(emptinessOperand, '')]);
  });

  it.each([[null], [undefined], [''], ['[]']])(
    'treats %p as an empty value',
    (value) => {
      expect(
        turnEmptyFilterValuesIntoEmptinessOperands([
          recordFilter(ViewFilterOperand.IS, value as string),
        ]),
      ).toEqual([recordFilter(ViewFilterOperand.IS_EMPTY, value as string)]);
    },
  );

  it.each([
    [ViewFilterOperand.GREATER_THAN_OR_EQUAL],
    [ViewFilterOperand.LESS_THAN_OR_EQUAL],
    [ViewFilterOperand.IS_BEFORE],
    [ViewFilterOperand.IS_AFTER],
    [ViewFilterOperand.IS_RELATIVE],
    [ViewFilterOperand.VECTOR_SEARCH],
  ])('leaves %s untouched so the step still rejects it', (operand) => {
    const recordFilters = [recordFilter(operand, '')];

    expect(turnEmptyFilterValuesIntoEmptinessOperands(recordFilters)).toEqual(
      recordFilters,
    );
  });

  it('leaves an operand that never expects a value untouched', () => {
    const recordFilters = [recordFilter(ViewFilterOperand.IS_NOT_EMPTY, '')];

    expect(turnEmptyFilterValuesIntoEmptinessOperands(recordFilters)).toEqual(
      recordFilters,
    );
  });
});
