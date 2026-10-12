import { isFlatFieldMetadataRequiredOnCreate } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-required-on-create.util';

describe('isFlatFieldMetadataRequiredOnCreate', () => {
  it('should require a non-nullable field without a default value', () => {
    expect(
      isFlatFieldMetadataRequiredOnCreate({
        isNullable: false,
        defaultValue: null,
      }),
    ).toBe(true);
  });

  it.each([0, false, "''"])(
    'should not require a non-nullable field with the default value %p',
    (defaultValue) => {
      expect(
        isFlatFieldMetadataRequiredOnCreate({
          isNullable: false,
          defaultValue,
        }),
      ).toBe(false);
    },
  );

  it.each([true, null])(
    'should not require a field whose isNullable is %p',
    (isNullable) => {
      expect(
        isFlatFieldMetadataRequiredOnCreate({ isNullable, defaultValue: null }),
      ).toBe(false);
    },
  );
});
