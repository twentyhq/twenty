import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import { validatePageLayoutFilterDefaultValue } from 'src/engine/metadata-modules/flat-page-layout/validators/utils/validate-page-layout-filter-default-value.util';

const validateConditions = (
  conditions: { operand: ViewFilterOperand; value: string }[],
) =>
  validatePageLayoutFilterDefaultValue({
    defaultValue: { conditions },
    valueFormatFieldType: FieldMetadataType.DATE,
    filterLabel: 'Period',
  });

describe('validatePageLayoutFilterDefaultValue', () => {
  it('should accept a stringified relative date', () => {
    expect(
      validateConditions([
        { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_1_MONTH' },
      ]),
    ).toEqual([]);
  });

  it('should accept an absolute range written as two conditions', () => {
    expect(
      validateConditions([
        { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01' },
        { operand: ViewFilterOperand.IS_BEFORE, value: '2026-03-31' },
      ]),
    ).toEqual([]);
  });

  it('should accept an operand that takes no value', () => {
    expect(
      validateConditions([{ operand: ViewFilterOperand.IS_TODAY, value: '' }]),
    ).toEqual([]);
  });

  it('should reject an operand that date fields do not support', () => {
    const errors = validateConditions([
      { operand: ViewFilterOperand.CONTAINS, value: 'anything' },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('"CONTAINS"');
    expect(errors[0].message).toContain('"Period"');
  });

  // The reported case of #23397, here on a dashboard filter default
  it('should reject the object form of a relative date', () => {
    const errors = validateConditions([
      {
        operand: ViewFilterOperand.IS_RELATIVE,
        value: JSON.stringify({ direction: 'PAST', amount: 1, unit: 'MONTH' }),
      },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('is not valid for operand');
    expect(errors[0].message).toContain('stringified relative date');
  });

  it('should reject a value that is not a date', () => {
    const errors = validateConditions([
      { operand: ViewFilterOperand.IS_BEFORE, value: 'last tuesday' },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].value).toBe('last tuesday');
  });

  it('should reject a default value without conditions', () => {
    const errors = validateConditions([]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('has no condition');
  });

  it('should reject an empty value for an operand that expects one', () => {
    const errors = validateConditions([
      { operand: ViewFilterOperand.IS_RELATIVE, value: '' },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('has no value');
  });

  it('should reject a date time value since plain dates are the canonical format', () => {
    expect(
      validateConditions([
        { operand: ViewFilterOperand.IS_BEFORE, value: '2026-03-31T00:00:00Z' },
      ]),
    ).toHaveLength(1);
  });

  it('should report every invalid condition', () => {
    expect(
      validateConditions([
        { operand: ViewFilterOperand.IS_AFTER, value: 'not a date' },
        { operand: ViewFilterOperand.IS_NOT, value: '2026-01-01' },
      ]),
    ).toHaveLength(2);
  });
});
