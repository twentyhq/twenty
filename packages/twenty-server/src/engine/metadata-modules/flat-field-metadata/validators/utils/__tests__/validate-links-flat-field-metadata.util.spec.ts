import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { validateLinksFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-links-flat-field-metadata.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

type LinksFlatFieldMetadataOverrides = Partial<
  Omit<UniversalFlatFieldMetadata<FieldMetadataType.LINKS>, 'universalSettings'>
> & { universalSettings?: Record<string, unknown> };

const createFlatEntityToValidate = (
  overrides: LinksFlatFieldMetadataOverrides = {},
): UniversalFlatFieldMetadata<FieldMetadataType.LINKS> =>
  ({
    type: FieldMetadataType.LINKS,
    name: 'testLinksField',
    label: 'Test Links Field',
    universalSettings: { maxNumberOfValues: 1 },
    ...overrides,
  }) as UniversalFlatFieldMetadata<FieldMetadataType.LINKS>;

const callValidator = (
  flatEntityToValidate: UniversalFlatFieldMetadata<FieldMetadataType.LINKS>,
) =>
  validateLinksFlatFieldMetadata({
    flatEntityToValidate,
  } as Parameters<typeof validateLinksFlatFieldMetadata>[0]);

const stripUserFriendlyMessage = (errors: FlatFieldMetadataValidationError[]) =>
  errors.map(({ userFriendlyMessage: _, ...rest }) => rest);

describe('validateLinksFlatFieldMetadata', () => {
  it('should return no errors for a links field with no variant set', () => {
    const errors = callValidator(createFlatEntityToValidate());

    expect(errors).toMatchInlineSnapshot('[]');
  });

  it('should return no errors for a domain-typed links field', () => {
    const errors = callValidator(
      createFlatEntityToValidate({
        universalSettings: { maxNumberOfValues: 1, type: 'domain' },
      }),
    );

    expect(errors).toMatchInlineSnapshot('[]');
  });

  it('should return an error for a variant it does not know', () => {
    const errors = callValidator(
      createFlatEntityToValidate({ universalSettings: { type: 'Domain' } }),
    );

    expect(stripUserFriendlyMessage(errors)).toMatchInlineSnapshot(`
[
  {
    "code": "INVALID_FIELD_INPUT",
    "message": "Links field type must be one of url, domain",
  },
]
`);
  });
});
