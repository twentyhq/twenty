import { generateNullable } from 'src/engine/metadata-modules/field-metadata/utils/generate-nullable';

describe('generateNullable', () => {
  it('should should return true if no input is given', () => {
    expect(generateNullable()).toEqual(true);
  });

  it('should should return the input value if the input value is given', () => {
    expect(generateNullable(true)).toEqual(true);
    expect(generateNullable(false)).toEqual(false);
  });
});
