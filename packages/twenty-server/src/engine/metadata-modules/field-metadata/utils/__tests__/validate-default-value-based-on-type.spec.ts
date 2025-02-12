import { FieldMetadataType } from 'twenty-shared';

import { validateDefaultValueForType } from 'src/engine/metadata-modules/field-metadata/utils/validate-default-value-for-type.util';

describe('validateDefaultValueForType', () => {
  it('should return true for null defaultValue', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.TEXT, null).isValid,
    ).toBe(true);
  });

  // Dynamic default values
  it('should validate uuid dynamic default value for UUID type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.UUID, 'uuid').isValid,
    ).toBe(true);
  });

  it('should validate now dynamic default value for DATE_TIME type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.DATE_TIME, 'now').isValid,
    ).toBe(true);
  });

  it('should return false for mismatched dynamic default value', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.UUID, 'now').isValid,
    ).toBe(false);
  });

  // Static default values
  it('should validate string default value for TEXT type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.TEXT, "'test'").isValid,
    ).toBe(true);
  });

  it('should return false for invalid string default value for TEXT type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.TEXT, 123).isValid,
    ).toBe(false);
  });

  it('should validate number default value for NUMBER type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.NUMBER, 100).isValid,
    ).toBe(true);
  });

  it('should return false for invalid number default value for NUMBER type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.NUMBER, '100').isValid,
    ).toBe(false);
  });

  it('should validate boolean default value for BOOLEAN type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.BOOLEAN, true).isValid,
    ).toBe(true);
  });

  it('should return false for invalid boolean default value for BOOLEAN type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.BOOLEAN, 'true').isValid,
    ).toBe(false);
  });

  // CURRENCY type
  it('should validate CURRENCY default value', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.CURRENCY, {
        amountMicros: '100',
        currencyCode: "'USD'",
      }).isValid,
    ).toBe(true);
  });

  it('should return false for invalid CURRENCY default value', () => {
    expect(
      validateDefaultValueForType(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error Just for testing purposes
        { amountMicros: 100, currencyCode: "'USD'" },
        FieldMetadataType.CURRENCY,
      ).isValid,
    ).toBe(false);
  });

  // Unknown type
  it('should return false for unknown type', () => {
    expect(
      validateDefaultValueForType('unknown' as FieldMetadataType, "'test'")
        .isValid,
    ).toBe(false);
  });
});
