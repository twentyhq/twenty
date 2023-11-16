import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { validateDefaultValueBasedOnType } from 'src/metadata/field-metadata/utils/validate-default-value-based-on-type.util';

describe('validateDefaultValueBasedOnType', () => {
  it('should return true for null defaultValue', () => {
    expect(validateDefaultValueBasedOnType(null, FieldMetadataType.TEXT)).toBe(
      true,
    );
  });

  // Dynamic default values
  it('should validate uuid dynamic default value for UUID type', () => {
    expect(
      validateDefaultValueBasedOnType({ type: 'uuid' }, FieldMetadataType.UUID),
    ).toBe(true);
  });

  it('should validate now dynamic default value for DATE type', () => {
    expect(
      validateDefaultValueBasedOnType({ type: 'now' }, FieldMetadataType.DATE),
    ).toBe(true);
  });

  it('should return false for mismatched dynamic default value', () => {
    expect(
      validateDefaultValueBasedOnType({ type: 'now' }, FieldMetadataType.UUID),
    ).toBe(false);
  });

  // Static default values
  it('should validate string default value for TEXT type', () => {
    expect(
      validateDefaultValueBasedOnType(
        { value: 'test' },
        FieldMetadataType.TEXT,
      ),
    ).toBe(true);
  });

  it('should return false for invalid string default value for TEXT type', () => {
    expect(
      validateDefaultValueBasedOnType({ value: 123 }, FieldMetadataType.TEXT),
    ).toBe(false);
  });

  it('should validate string default value for PHONE type', () => {
    expect(
      validateDefaultValueBasedOnType(
        { value: '+123456789' },
        FieldMetadataType.PHONE,
      ),
    ).toBe(true);
  });

  it('should return false for invalid string default value for PHONE type', () => {
    expect(
      validateDefaultValueBasedOnType({ value: 123 }, FieldMetadataType.PHONE),
    ).toBe(false);
  });

  it('should validate string default value for EMAIL type', () => {
    expect(
      validateDefaultValueBasedOnType(
        { value: 'test@example.com' },
        FieldMetadataType.EMAIL,
      ),
    ).toBe(true);
  });

  it('should return false for invalid string default value for EMAIL type', () => {
    expect(
      validateDefaultValueBasedOnType({ value: 123 }, FieldMetadataType.EMAIL),
    ).toBe(false);
  });

  it('should validate number default value for NUMBER type', () => {
    expect(
      validateDefaultValueBasedOnType({ value: 100 }, FieldMetadataType.NUMBER),
    ).toBe(true);
  });

  it('should return false for invalid number default value for NUMBER type', () => {
    expect(
      validateDefaultValueBasedOnType(
        { value: '100' },
        FieldMetadataType.NUMBER,
      ),
    ).toBe(false);
  });

  it('should validate number default value for PROBABILITY type', () => {
    expect(
      validateDefaultValueBasedOnType(
        { value: 0.5 },
        FieldMetadataType.PROBABILITY,
      ),
    ).toBe(true);
  });

  it('should return false for invalid number default value for PROBABILITY type', () => {
    expect(
      validateDefaultValueBasedOnType(
        { value: '50%' },
        FieldMetadataType.PROBABILITY,
      ),
    ).toBe(false);
  });

  it('should validate boolean default value for BOOLEAN type', () => {
    expect(
      validateDefaultValueBasedOnType(
        { value: true },
        FieldMetadataType.BOOLEAN,
      ),
    ).toBe(true);
  });

  it('should return false for invalid boolean default value for BOOLEAN type', () => {
    expect(
      validateDefaultValueBasedOnType(
        { value: 'true' },
        FieldMetadataType.BOOLEAN,
      ),
    ).toBe(false);
  });

  // URL type
  it('should validate URL default value', () => {
    expect(
      validateDefaultValueBasedOnType(
        { text: 'http://example.com', link: 'Example' },
        FieldMetadataType.URL,
      ),
    ).toBe(true);
  });

  it('should return false for invalid URL default value', () => {
    expect(
      validateDefaultValueBasedOnType(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error Just for testing purposes
        { text: 123, link: {} },
        FieldMetadataType.URL,
      ),
    ).toBe(false);
  });

  // MONEY type
  it('should validate MONEY default value', () => {
    expect(
      validateDefaultValueBasedOnType(
        { amount: 100, currency: 'USD' },
        FieldMetadataType.MONEY,
      ),
    ).toBe(true);
  });

  it('should return false for invalid MONEY default value', () => {
    expect(
      validateDefaultValueBasedOnType(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error Just for testing purposes
        { amount: '100', currency: 'USD' },
        FieldMetadataType.MONEY,
      ),
    ).toBe(false);
  });

  // Unknown type
  it('should return false for unknown type', () => {
    expect(
      validateDefaultValueBasedOnType(
        { value: 'test' },
        'unknown' as FieldMetadataType,
      ),
    ).toBe(false);
  });
});
