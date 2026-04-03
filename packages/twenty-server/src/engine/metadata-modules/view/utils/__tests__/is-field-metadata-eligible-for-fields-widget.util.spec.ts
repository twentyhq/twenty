import { FieldMetadataType } from 'twenty-shared/types';

import { isFieldMetadataEligibleForFieldsWidget } from 'twenty-shared/utils';

describe('isFieldMetadataEligibleForFieldsWidget', () => {
  it('should exclude deletedAt field', () => {
    expect(
      isFieldMetadataEligibleForFieldsWidget({
        fieldName: 'deletedAt',
        fieldType: FieldMetadataType.DATE_TIME,
        isLabelIdentifierField: false,
      }),
    ).toBe(false);
  });

  it('should exclude TS_VECTOR fields', () => {
    expect(
      isFieldMetadataEligibleForFieldsWidget({
        fieldName: 'searchVector',
        fieldType: FieldMetadataType.TS_VECTOR,
        isLabelIdentifierField: false,
      }),
    ).toBe(false);
  });

  it('should exclude POSITION fields', () => {
    expect(
      isFieldMetadataEligibleForFieldsWidget({
        fieldName: 'position',
        fieldType: FieldMetadataType.POSITION,
        isLabelIdentifierField: false,
      }),
    ).toBe(false);
  });

  it('should exclude id field when it is not the label identifier', () => {
    expect(
      isFieldMetadataEligibleForFieldsWidget({
        fieldName: 'id',
        fieldType: FieldMetadataType.UUID,
        isLabelIdentifierField: false,
      }),
    ).toBe(false);
  });

  it('should exclude id field even when it is the label identifier', () => {
    expect(
      isFieldMetadataEligibleForFieldsWidget({
        fieldName: 'id',
        fieldType: FieldMetadataType.UUID,
        isLabelIdentifierField: true,
      }),
    ).toBe(false);
  });

  it('should include a normal field', () => {
    expect(
      isFieldMetadataEligibleForFieldsWidget({
        fieldName: 'name',
        fieldType: FieldMetadataType.TEXT,
        isLabelIdentifierField: false,
      }),
    ).toBe(true);
  });

  it('should include createdAt field', () => {
    expect(
      isFieldMetadataEligibleForFieldsWidget({
        fieldName: 'createdAt',
        fieldType: FieldMetadataType.DATE_TIME,
        isLabelIdentifierField: false,
      }),
    ).toBe(true);
  });
});
