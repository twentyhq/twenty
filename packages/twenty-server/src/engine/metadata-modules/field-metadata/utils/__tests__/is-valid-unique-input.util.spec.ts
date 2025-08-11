import { FieldMetadataType } from 'twenty-shared/types';

import { isValidUniqueFieldDefaultValueCombination } from 'src/engine/metadata-modules/field-metadata/utils/is-valid-unique-input.util';

describe('isValidUniqueFieldDefaultValueCombination', () => {
  it('should return true if the field has a custom default value and is not unique', () => {
    const result = isValidUniqueFieldDefaultValueCombination({
      defaultValue: "'custom value'",
      isUnique: false,
      type: FieldMetadataType.TEXT,
    });

    expect(result).toBe(true);
  });

  it('should return true if the field has standard default value and is unique', () => {
    const result = isValidUniqueFieldDefaultValueCombination({
      defaultValue: "''",
      isUnique: true,
      type: FieldMetadataType.TEXT,
    });

    expect(result).toBe(true);
  });

  it('should return false if the field has custom default value and is unique', () => {
    const result = isValidUniqueFieldDefaultValueCombination({
      defaultValue: "'custom value'",
      isUnique: true,
      type: FieldMetadataType.TEXT,
    });

    expect(result).toBe(false);
  });
});
