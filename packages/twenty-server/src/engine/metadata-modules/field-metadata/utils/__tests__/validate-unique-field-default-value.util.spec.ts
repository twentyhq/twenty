import { FieldMetadataType } from 'twenty-shared/types';

import { validateUniqueFieldDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/validate-unique-field-default-value.util';

describe('validateUniqueFieldDefaultValue', () => {
  it('should return true if the field has a custom default value and is not unique', () => {
    const result = validateUniqueFieldDefaultValue(
      "'custom value'",
      false,
      FieldMetadataType.TEXT,
    );

    expect(result).toBe(true);
  });
  it('should return true if the field has no custom default value and is unique', () => {
    const result = validateUniqueFieldDefaultValue(
      undefined,
      true,
      FieldMetadataType.TEXT,
    );

    expect(result).toBe(true);
  });

  it('should return true if the field has standard default value and is unique', () => {
    const result = validateUniqueFieldDefaultValue(
      "''",
      true,
      FieldMetadataType.TEXT,
    );

    expect(result).toBe(true);
  });

  it('should return false if the field has custom default value and is unique', () => {
    const result = validateUniqueFieldDefaultValue(
      "'custom value'",
      true,
      FieldMetadataType.TEXT,
    );

    expect(result).toBe(false);
  });
});
