import { FieldMetadataType } from 'twenty-shared';

import { generateNullable } from 'src/engine/metadata-modules/field-metadata/utils/generate-nullable';

describe('generateNullable', () => {
  it('should generate a nullable value false for TEXT, EMAIL, PHONE no matter what the input is', () => {
    expect(generateNullable(FieldMetadataType.TEXT, false)).toEqual(false);

    expect(generateNullable(FieldMetadataType.TEXT, true)).toEqual(false);

    expect(generateNullable(FieldMetadataType.TEXT)).toEqual(false);
  });

  it('should should return true if no input is given', () => {
    expect(generateNullable(FieldMetadataType.DATE_TIME)).toEqual(true);
  });

  it('should should return the input value if the input value is given', () => {
    expect(generateNullable(FieldMetadataType.DATE_TIME, true)).toEqual(true);
    expect(generateNullable(FieldMetadataType.DATE_TIME, false)).toEqual(false);
  });
});
