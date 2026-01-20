import { FieldMetadataType } from 'twenty-shared/types';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { validateFilesFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-files-flat-field-metadata.util';

const createFlatEntityToValidate = (
  overrides: Partial<FlatFieldMetadata<FieldMetadataType.FILES>> = {},
): FlatFieldMetadata<FieldMetadataType.FILES> =>
  ({
    type: FieldMetadataType.FILES,
    name: 'testFilesField',
    label: 'Test Files Field',
    settings: { maxNumberOfValues: 5 },
    isUnique: false,
    ...overrides,
  }) as FlatFieldMetadata<FieldMetadataType.FILES>;

const callValidator = (
  flatEntityToValidate: FlatFieldMetadata<FieldMetadataType.FILES>,
  featureFlagEnabled = true,
) =>
  validateFilesFlatFieldMetadata({
    flatEntityToValidate,
    additionalCacheDataMaps: {
      featureFlagsMap: {
        [FeatureFlagKey.IS_FILES_FIELD_ENABLED]: featureFlagEnabled,
      },
    },
  } as Parameters<typeof validateFilesFlatFieldMetadata>[0]);

describe('validateFilesFlatFieldMetadata', () => {
  it('should return no errors for a valid files field', () => {
    const errors = callValidator(createFlatEntityToValidate());

    expect(errors).toHaveLength(0);
  });

  it('should return error when feature flag is disabled', () => {
    const errors = callValidator(createFlatEntityToValidate(), false);

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(FieldMetadataExceptionCode.INVALID_FIELD_INPUT);
    expect(errors[0].message).toContain('Files field type is not supported');
  });

  it('should return error when isUnique is true', () => {
    const errors = callValidator(
      createFlatEntityToValidate({ isUnique: true }),
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(FieldMetadataExceptionCode.INVALID_FIELD_INPUT);
    expect(errors[0].message).toContain(
      'Files field is not supported for unique fields',
    );
  });

  it('should return error when settings is undefined', () => {
    const errors = callValidator(
      createFlatEntityToValidate({ settings: undefined }),
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(FieldMetadataExceptionCode.INVALID_FIELD_INPUT);
    expect(errors[0].message).toContain(
      'maxNumberOfValues must be defined in settings',
    );
  });

  it('should return error when maxNumberOfValues is 0', () => {
    const errors = callValidator(
      createFlatEntityToValidate({ settings: { maxNumberOfValues: 0 } }),
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(FieldMetadataExceptionCode.INVALID_FIELD_INPUT);
  });

  it('should return error when maxNumberOfValues exceeds max (11)', () => {
    const errors = callValidator(
      createFlatEntityToValidate({ settings: { maxNumberOfValues: 11 } }),
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(FieldMetadataExceptionCode.INVALID_FIELD_INPUT);
  });
});
