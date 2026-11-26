import { getFieldMetadataFormulaEvaluation } from '@/utils/formula/getFieldMetadataFormulaEvaluation';

describe('getFieldMetadataFormulaEvaluation', () => {
  it('should return STORED for a stored formula', () => {
    expect(
      getFieldMetadataFormulaEvaluation({
        formula: { expression: 'count(tasks)', evaluation: 'STORED' },
      }),
    ).toBe('STORED');
  });

  it('should default a formula to QUERY_TIME', () => {
    expect(
      getFieldMetadataFormulaEvaluation({
        formula: { expression: 'employees * 2' },
      }),
    ).toBe('QUERY_TIME');
  });

  it.each([
    { formula: null },
    { formula: {} },
    { formula: { expression: '', evaluation: 'STORED' } },
  ])('should return undefined for $formula', ({ formula }) => {
    expect(getFieldMetadataFormulaEvaluation({ formula })).toBeUndefined();
  });
});
