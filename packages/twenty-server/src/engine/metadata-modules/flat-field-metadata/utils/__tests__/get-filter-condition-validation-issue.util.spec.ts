import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import { getFilterConditionValidationIssue } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-filter-condition-validation-issue.util';

describe('getFilterConditionValidationIssue', () => {
  it('should find no issue in a valid condition', () => {
    expect(
      getFilterConditionValidationIssue({
        fieldType: FieldMetadataType.DATE,
        operand: ViewFilterOperand.IS_AFTER,
        value: '2026-01-01',
      }),
    ).toBeUndefined();
  });

  it('should list the allowed operands when the operand is not one of them', () => {
    expect(
      getFilterConditionValidationIssue({
        fieldType: FieldMetadataType.BOOLEAN,
        operand: ViewFilterOperand.CONTAINS,
        value: 'true',
      }),
    ).toEqual({
      kind: 'UNSUPPORTED_OPERAND',
      allowedOperands: [ViewFilterOperand.IS],
    });
  });

  it('should describe a value the operand does not accept', () => {
    expect(
      getFilterConditionValidationIssue({
        fieldType: FieldMetadataType.DATE,
        operand: ViewFilterOperand.IS_AFTER,
        value: 'yesterday',
      }),
    ).toMatchObject({
      kind: 'INVALID_VALUE',
      operand: ViewFilterOperand.IS_AFTER,
      filterType: 'DATE',
      stringifiedValue: 'yesterday',
    });
  });

  it('should use the sub field operands of a composite field', () => {
    expect(
      getFilterConditionValidationIssue({
        fieldType: FieldMetadataType.CURRENCY,
        operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
        subFieldName: 'currencyCode',
        value: '["EUR"]',
      }),
    ).toMatchObject({ kind: 'UNSUPPORTED_OPERAND' });
  });
});
