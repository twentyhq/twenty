import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { validateDefaultValueForType } from 'src/engine/metadata-modules/field-metadata/utils/validate-default-value-for-type.util';

describe('validateDefaultValueForType', () => {
  it('should return true for null defaultValue', () => {
    expect(validateDefaultValueForType(FieldMetadataType.TEXT, null)).toBe(
      true,
    );
  });

  // Dynamic default values
  it('should validate uuid dynamic default value for UUID type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.UUID, { value: 'uuid' }),
    ).toBe(true);
  });

  it('should validate now dynamic default value for DATE_TIME type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.DATE_TIME, {
        value: 'now',
      }),
    ).toBe(true);
  });

  it('should return false for mismatched dynamic default value', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.UUID, { value: 'now' }),
    ).toBe(false);
  });

  // Static default values
  it('should validate string default value for TEXT type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.TEXT, { value: "'test'" }),
    ).toBe(true);
  });

  it('should return false for invalid string default value for TEXT type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.TEXT, { value: 123 }),
    ).toBe(false);
  });

  it('should validate string default value for PHONE type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.PHONE, {
        value: "'+123456789'",
      }),
    ).toBe(true);
  });

  it('should return false for invalid string default value for PHONE type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.PHONE, { value: 123 }),
    ).toBe(false);
  });

  it('should validate string default value for EMAIL type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.EMAIL, {
        value: "'test@example.com'",
      }),
    ).toBe(true);
  });

  it('should return false for invalid string default value for EMAIL type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.EMAIL, { value: 123 }),
    ).toBe(false);
  });

  it('should validate number default value for NUMBER type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.NUMBER, { value: 100 }),
    ).toBe(true);
  });

  it('should return false for invalid number default value for NUMBER type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.NUMBER, { value: '100' }),
    ).toBe(false);
  });

  it('should validate number default value for PROBABILITY type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.PROBABILITY, {
        value: 0.5,
      }),
    ).toBe(true);
  });

  it('should return false for invalid number default value for PROBABILITY type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.PROBABILITY, {
        value: '50%',
      }),
    ).toBe(false);
  });

  it('should validate boolean default value for BOOLEAN type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.BOOLEAN, { value: true }),
    ).toBe(true);
  });

  it('should return false for invalid boolean default value for BOOLEAN type', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.BOOLEAN, { value: 'true' }),
    ).toBe(false);
  });

  // LINK type
  it('should validate LINK default value', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.LINK, {
        label: "'http://example.com'",
        url: "'Example'",
      }),
    ).toBe(true);
  });

  it('should return false for invalid LINK default value', () => {
    expect(
      validateDefaultValueForType(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error Just for testing purposes
        { label: 123, url: {} },
        FieldMetadataType.LINK,
      ),
    ).toBe(false);
  });

  // CURRENCY type
  it('should validate CURRENCY default value', () => {
    expect(
      validateDefaultValueForType(FieldMetadataType.CURRENCY, {
        amountMicros: '100',
        currencyCode: "'USD'",
      }),
    ).toBe(true);
  });

  it('should return false for invalid CURRENCY default value', () => {
    expect(
      validateDefaultValueForType(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error Just for testing purposes
        { amountMicros: 100, currencyCode: "'USD'" },
        FieldMetadataType.CURRENCY,
      ),
    ).toBe(false);
  });

  // Unknown type
  it('should return false for unknown type', () => {
    expect(
      validateDefaultValueForType('unknown' as FieldMetadataType, {
        value: "'test'",
      }),
    ).toBe(false);
  });
});
