import { ViewFilterOperand } from '@/types';
import { getFilterOperandsForFilterableFieldType } from '@/utils/filter/utils/getFilterOperandsForFilterableFieldType';

describe('getFilterOperandsForFilterableFieldType', () => {
  const emptyOperands = [
    ViewFilterOperand.IS_EMPTY,
    ViewFilterOperand.IS_NOT_EMPTY,
  ];

  it('should return select operands', () => {
    expect(
      getFilterOperandsForFilterableFieldType({ filterType: 'SELECT' }),
    ).toEqual([
      ViewFilterOperand.IS,
      ViewFilterOperand.IS_NOT,
      ...emptyOperands,
    ]);
  });

  it('should preserve actor source subfield operands', () => {
    expect(
      getFilterOperandsForFilterableFieldType({
        filterType: 'ACTOR',
        subFieldName: 'source',
      }),
    ).toEqual([
      ViewFilterOperand.IS,
      ViewFilterOperand.IS_NOT,
      ...emptyOperands,
    ]);
  });

  it('should preserve actor workspace member subfield operands', () => {
    expect(
      getFilterOperandsForFilterableFieldType({
        filterType: 'ACTOR',
        subFieldName: 'workspaceMemberId',
      }),
    ).toEqual([
      ViewFilterOperand.IS,
      ViewFilterOperand.IS_NOT,
      ...emptyOperands,
    ]);
  });

  it('should default currency to amount operands', () => {
    expect(
      getFilterOperandsForFilterableFieldType({ filterType: 'CURRENCY' }),
    ).toEqual([
      ViewFilterOperand.GREATER_THAN_OR_EQUAL,
      ViewFilterOperand.LESS_THAN_OR_EQUAL,
      ViewFilterOperand.IS,
      ViewFilterOperand.IS_NOT,
      ViewFilterOperand.IS_BETWEEN,
      ...emptyOperands,
    ]);
  });
});
