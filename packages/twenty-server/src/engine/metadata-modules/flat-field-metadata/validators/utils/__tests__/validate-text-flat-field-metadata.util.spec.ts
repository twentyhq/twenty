import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { validateTextFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-text-flat-field-metadata.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const createFlatEntityToValidate = (
  overrides: Partial<UniversalFlatFieldMetadata<FieldMetadataType.TEXT>> = {},
): UniversalFlatFieldMetadata<FieldMetadataType.TEXT> =>
  ({
    type: FieldMetadataType.TEXT,
    name: 'testTextField',
    label: 'Test Text Field',
    universalSettings: {},
    isUnique: false,
    ...overrides,
  }) as UniversalFlatFieldMetadata<FieldMetadataType.TEXT>;

const callValidator = (
  flatEntityToValidate: UniversalFlatFieldMetadata<FieldMetadataType.TEXT>,
) =>
  validateTextFlatFieldMetadata({
    flatEntityToValidate,
  } as Parameters<typeof validateTextFlatFieldMetadata>[0]);

const stripUserFriendlyMessage = (errors: FlatFieldMetadataValidationError[]) =>
  errors.map(({ userFriendlyMessage: _, ...rest }) => rest);

describe('validateTextFlatFieldMetadata', () => {
  it('should return no errors when no validation pattern is set', () => {
    const errors = callValidator(createFlatEntityToValidate());

    expect(errors).toMatchInlineSnapshot('[]');
  });

  it('should return no errors for a valid validation pattern', () => {
    const errors = callValidator(
      createFlatEntityToValidate({
        universalSettings: { validationPattern: '^[A-Z]{3}[0-9]{3}$' },
      }),
    );

    expect(errors).toMatchInlineSnapshot('[]');
  });

  it('should return no errors when the validation pattern is an empty string', () => {
    const errors = callValidator(
      createFlatEntityToValidate({
        universalSettings: { validationPattern: '' },
      }),
    );

    expect(errors).toMatchInlineSnapshot('[]');
  });

  it('should return an error when the validation pattern is not a valid regular expression', () => {
    const errors = callValidator(
      createFlatEntityToValidate({
        universalSettings: { validationPattern: '[unclosed' },
      }),
    );

    expect(stripUserFriendlyMessage(errors)).toMatchInlineSnapshot(`
[
  {
    "code": "INVALID_FIELD_INPUT",
    "message": "validationPattern is not a valid regular expression: [unclosed",
  },
]
`);
  });
});
