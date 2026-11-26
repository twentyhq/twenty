import { getFieldMetadataFormulaEvaluation } from '@/utils/formula/getFieldMetadataFormulaEvaluation';

describe('getFieldMetadataFormulaEvaluation', () => {
  it('should return STORED for a stored formula', () => {
    expect(
      getFieldMetadataFormulaEvaluation({
        settings: {
          formula: { expression: 'count(tasks)', evaluation: 'STORED' },
        },
      }),
    ).toBe('STORED');
  });

  it('should default a formula to QUERY_TIME', () => {
    expect(
      getFieldMetadataFormulaEvaluation({
        settings: { formula: { expression: 'employees * 2' } },
      }),
    ).toBe('QUERY_TIME');
  });

  it.each([
    { settings: null },
    { settings: { decimals: 2 } },
    { settings: { formula: { expression: '', evaluation: 'STORED' } } },
  ])('should return undefined for $settings', ({ settings }) => {
    expect(getFieldMetadataFormulaEvaluation({ settings })).toBeUndefined();
  });
});
