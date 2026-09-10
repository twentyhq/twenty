import { ViewFilterOperand } from 'twenty-shared/types';

import { resolveFilterValueAndOperand } from 'src/modules/workflow/workflow-executor/utils/resolve-filter-value-and-operand.util';

const context = {
  trigger: { companyId: null, name: 'Acme', missing: undefined },
};

const resolve = (value: unknown, operand = ViewFilterOperand.IS) =>
  resolveFilterValueAndOperand({ value, operand, context });

describe('resolveFilterValueAndOperand', () => {
  it('resolves a variable and keeps the operand when it has a value', () => {
    expect(resolve('{{trigger.name}}')).toEqual({
      value: 'Acme',
      operand: ViewFilterOperand.IS,
    });
  });

  it.each([
    [ViewFilterOperand.IS, ViewFilterOperand.IS_EMPTY],
    [ViewFilterOperand.IS_NOT, ViewFilterOperand.IS_NOT_EMPTY],
    [ViewFilterOperand.CONTAINS, ViewFilterOperand.IS_EMPTY],
    [ViewFilterOperand.DOES_NOT_CONTAIN, ViewFilterOperand.IS_NOT_EMPTY],
  ])(
    'turns %s into %s when the variable resolves to null',
    (operand, emptinessOperand) => {
      expect(resolve('{{trigger.companyId}}', operand)).toEqual({
        value: null,
        operand: emptinessOperand,
      });
    },
  );

  it('leaves a filter the user never filled alone', () => {
    expect(resolve('')).toEqual({ value: '', operand: ViewFilterOperand.IS });
  });

  it('leaves a literal value alone even when it reads as empty', () => {
    expect(resolve('[]')).toEqual({
      value: '[]',
      operand: ViewFilterOperand.IS,
    });
  });

  it('keeps the operand when a variable cannot be resolved at all', () => {
    expect(resolve('{{trigger.missing}}')).toEqual({
      value: undefined,
      operand: ViewFilterOperand.IS,
    });
  });

  it.each([
    [ViewFilterOperand.GREATER_THAN_OR_EQUAL],
    [ViewFilterOperand.LESS_THAN_OR_EQUAL],
    [ViewFilterOperand.IS_BEFORE],
    [ViewFilterOperand.IS_AFTER],
  ])('keeps %s, which has no emptiness reading', (operand) => {
    expect(resolve('{{trigger.companyId}}', operand)).toEqual({
      value: null,
      operand,
    });
  });
});
