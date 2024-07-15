import { assertDoesNotNullifyDefaultValueForNonNullableField } from 'src/engine/metadata-modules/field-metadata/utils/assert-does-not-nullify-default-value-for-non-nullable-field.util';

describe('assertDoesNotNullifyDefaultValueForNonNullableField', () => {
  it('should not throw if default value is set to null and field is nullable', () => {
    expect(() =>
      assertDoesNotNullifyDefaultValueForNonNullableField({
        isNullable: true,
        defaultValueFromUpdate: null,
      }),
    ).not.toThrow();
  });

  it('should not throw if default value is undefined and field is non nullable', () => {
    expect(() =>
      assertDoesNotNullifyDefaultValueForNonNullableField({
        isNullable: false,
      }),
    ).not.toThrow();
  });

  it('should not throw if default value is not set to null and field is non nullable', () => {
    expect(() =>
      assertDoesNotNullifyDefaultValueForNonNullableField({
        isNullable: false,
        defaultValueFromUpdate: 'new default value',
      }),
    ).not.toThrow();
  });

  it('should throw if default value is set to null and field is non nullable', () => {
    expect(() =>
      assertDoesNotNullifyDefaultValueForNonNullableField({
        isNullable: false,
        defaultValueFromUpdate: null,
      }),
    ).toThrow();
  });
});
