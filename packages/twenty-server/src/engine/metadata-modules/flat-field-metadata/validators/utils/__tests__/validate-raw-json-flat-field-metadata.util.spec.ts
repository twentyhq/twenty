import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { validateRawJsonFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-raw-json-flat-field-metadata.util';

describe('validateRawJsonFlatFieldMetadata', () => {
  it.each([
    undefined,
    null,
    {},
    { isValueLoadedOnOpen: true },
    { isValueLoadedOnOpen: false },
    { isValueLoadedOnOpen: undefined },
    { legacySetting: 'preserved' },
    { isValueLoadedOnOpen: true, legacySetting: 'preserved' },
  ])(
    'accepts supported or absent loading settings: %p',
    (universalSettings) => {
      expect(
        validateRawJsonFlatFieldMetadata({
          flatEntityToValidate: { universalSettings },
        }),
      ).toEqual([]);
    },
  );

  it.each([null, 'true', 'false', 0, 1, {}, []])(
    'rejects a non-boolean loading setting: %p',
    (isValueLoadedOnOpen) => {
      expect(
        validateRawJsonFlatFieldMetadata({
          flatEntityToValidate: {
            universalSettings: { isValueLoadedOnOpen },
          },
        }),
      ).toEqual([
        expect.objectContaining({
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message: 'JSON field isValueLoadedOnOpen setting must be a boolean',
        }),
      ]);
    },
  );

  it.each(['legacy settings', [], 1, false])(
    'does not add validation for unrelated legacy settings: %p',
    (universalSettings) => {
      expect(
        validateRawJsonFlatFieldMetadata({
          flatEntityToValidate: { universalSettings },
        }),
      ).toEqual([]);
    },
  );
});
