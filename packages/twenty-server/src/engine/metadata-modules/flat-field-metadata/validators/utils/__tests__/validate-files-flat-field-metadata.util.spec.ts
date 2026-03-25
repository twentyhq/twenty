import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { validateFilesFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-files-flat-field-metadata.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const createFlatEntityToValidate = (
  overrides: Partial<UniversalFlatFieldMetadata<FieldMetadataType.FILES>> = {},
): UniversalFlatFieldMetadata<FieldMetadataType.FILES> =>
  ({
    type: FieldMetadataType.FILES,
    name: 'testFilesField',
    label: 'Test Files Field',
    universalSettings: { maxNumberOfValues: 5 },
    isUnique: false,
    ...overrides,
  }) as UniversalFlatFieldMetadata<FieldMetadataType.FILES>;

const callValidator = (
  flatEntityToValidate: UniversalFlatFieldMetadata<FieldMetadataType.FILES>,
) =>
  validateFilesFlatFieldMetadata({
    flatEntityToValidate,
  } as Parameters<typeof validateFilesFlatFieldMetadata>[0]);

const stripUserFriendlyMessage = (errors: FlatFieldMetadataValidationError[]) =>
  errors.map(({ userFriendlyMessage: _, ...rest }) => rest);

describe('validateFilesFlatFieldMetadata', () => {
  it('should return no errors for a valid files field', () => {
    const errors = callValidator(createFlatEntityToValidate());

    expect(errors).toMatchInlineSnapshot('[]');
  });

  it('should return error when isUnique is true', () => {
    const errors = callValidator(
      createFlatEntityToValidate({ isUnique: true }),
    );

    expect(stripUserFriendlyMessage(errors)).toMatchInlineSnapshot(`
[
  {
    "code": "INVALID_FIELD_INPUT",
    "message": "Files field is not supported for unique fields",
  },
]
`);
  });

  it('should return error when universalSettings is undefined', () => {
    const errors = callValidator(
      createFlatEntityToValidate({ universalSettings: undefined }),
    );

    expect(stripUserFriendlyMessage(errors)).toMatchInlineSnapshot(`
[
  {
    "code": "INVALID_FIELD_INPUT",
    "message": "maxNumberOfValues must be defined in settings and be a number greater than 0 and less than or equal to 10",
  },
]
`);
  });

  it('should return error when maxNumberOfValues is 0', () => {
    const errors = callValidator(
      createFlatEntityToValidate({
        universalSettings: { maxNumberOfValues: 0 },
      }),
    );

    expect(stripUserFriendlyMessage(errors)).toMatchInlineSnapshot(`
[
  {
    "code": "INVALID_FIELD_INPUT",
    "message": "maxNumberOfValues must be defined in settings and be a number greater than 0 and less than or equal to 10",
  },
]
`);
  });

  it('should return error when maxNumberOfValues exceeds max (11)', () => {
    const errors = callValidator(
      createFlatEntityToValidate({
        universalSettings: { maxNumberOfValues: 11 },
      }),
    );

    expect(stripUserFriendlyMessage(errors)).toMatchInlineSnapshot(`
[
  {
    "code": "INVALID_FIELD_INPUT",
    "message": "maxNumberOfValues must be defined in settings and be a number greater than 0 and less than or equal to 10",
  },
]
`);
  });
});
