import { FieldMetadataType, ViewFilterOperand } from '@/types';
import { isFilterOperandAvailableForFieldType } from '@/utils/filter/utils/isFilterOperandAvailableForFieldType';

describe('isFilterOperandAvailableForFieldType', () => {
  it('should reject an IS operand on a text field', () => {
    expect(
      isFilterOperandAvailableForFieldType({
        fieldType: FieldMetadataType.TEXT,
        operand: ViewFilterOperand.IS,
      }),
    ).toBe(false);
  });

  it('should accept a contains operand on a text field', () => {
    expect(
      isFilterOperandAvailableForFieldType({
        fieldType: FieldMetadataType.TEXT,
        operand: ViewFilterOperand.CONTAINS,
      }),
    ).toBe(true);
  });

  it('should reject a contains operand on a select field', () => {
    expect(
      isFilterOperandAvailableForFieldType({
        fieldType: FieldMetadataType.SELECT,
        operand: ViewFilterOperand.CONTAINS,
      }),
    ).toBe(false);
  });

  it('should accept an IS operand on a select field', () => {
    expect(
      isFilterOperandAvailableForFieldType({
        fieldType: FieldMetadataType.SELECT,
        operand: ViewFilterOperand.IS,
      }),
    ).toBe(true);
  });

  it('should honor the currency subfield operand set', () => {
    expect(
      isFilterOperandAvailableForFieldType({
        fieldType: FieldMetadataType.CURRENCY,
        operand: ViewFilterOperand.IS,
        subFieldName: 'currencyCode',
      }),
    ).toBe(true);

    expect(
      isFilterOperandAvailableForFieldType({
        fieldType: FieldMetadataType.CURRENCY,
        operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
        subFieldName: 'currencyCode',
      }),
    ).toBe(false);
  });
});
