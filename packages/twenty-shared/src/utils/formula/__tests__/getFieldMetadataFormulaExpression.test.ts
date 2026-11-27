import { getFieldMetadataFormulaExpression } from '@/utils/formula/getFieldMetadataFormulaExpression';

describe('getFieldMetadataFormulaExpression', () => {
  it('should return the expression of a formula', () => {
    expect(
      getFieldMetadataFormulaExpression({
        formula: { expression: 'employees * 2' },
      }),
    ).toBe('employees * 2');
  });

  it.each([
    { formula: null },
    { formula: undefined },
    { formula: {} },
    { formula: { expression: '' } },
  ])('should return undefined for $formula', ({ formula }) => {
    expect(getFieldMetadataFormulaExpression({ formula })).toBeUndefined();
  });
});
