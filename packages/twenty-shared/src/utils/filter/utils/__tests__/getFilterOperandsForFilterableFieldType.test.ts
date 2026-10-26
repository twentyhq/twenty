import { ViewFilterOperand } from '@/types';
import { getFilterOperandsForFilterableFieldType } from '@/utils/filter/utils/getFilterOperandsForFilterableFieldType';

describe('getFilterOperandsForFilterableFieldType', () => {
  it.each([
    'addressStreet1',
    'addressStreet2',
    'addressCity',
    'addressState',
    'addressPostcode',
  ])('offers exact matching for %s', (subFieldName) => {
    expect(
      getFilterOperandsForFilterableFieldType({
        filterType: 'ADDRESS',
        subFieldName,
      }),
    ).toEqual(
      expect.arrayContaining([ViewFilterOperand.IS, ViewFilterOperand.IS_NOT]),
    );
  });

  it.each([undefined, 'addressCountry', 'addressLat', 'addressLng'])(
    'does not offer text equality for address subfield %s',
    (subFieldName) => {
      expect(
        getFilterOperandsForFilterableFieldType({
          filterType: 'ADDRESS',
          subFieldName,
        }),
      ).not.toContain(ViewFilterOperand.IS);
    },
  );

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
      ...emptyOperands,
    ]);
  });
});
