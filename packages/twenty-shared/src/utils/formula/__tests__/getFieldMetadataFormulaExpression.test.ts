import { getFieldMetadataFormulaExpression } from '@/utils/formula/getFieldMetadataFormulaExpression';

describe('getFieldMetadataFormulaExpression', () => {
  it('should return the expression of a formula field', () => {
    expect(
      getFieldMetadataFormulaExpression({
        settings: { decimals: 2, formula: { expression: 'employees * 2' } },
      }),
    ).toBe('employees * 2');
  });

  it.each([
    { settings: null },
    { settings: undefined },
    { settings: 'not-an-object' },
    { settings: { decimals: 2 } },
    { settings: { formula: null } },
    { settings: { formula: { expression: '' } } },
  ])('should return undefined for $settings', ({ settings }) => {
    expect(getFieldMetadataFormulaExpression({ settings })).toBeUndefined();
  });
});
