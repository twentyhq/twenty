import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { validateTsVectorFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-ts-vector-flat-field-metadata.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const createFlatEntityToValidate = (
  overrides: Partial<
    UniversalFlatFieldMetadata<FieldMetadataType.TS_VECTOR>
  > = {},
): UniversalFlatFieldMetadata<FieldMetadataType.TS_VECTOR> =>
  ({
    type: FieldMetadataType.TS_VECTOR,
    name: 'searchVector',
    label: 'Search Vector',
    isSystem: true,
    universalSettings: {
      asExpression: "to_tsvector('simple', COALESCE(\"name\", ''))",
      generatedType: 'STORED',
    },
    ...overrides,
  }) as UniversalFlatFieldMetadata<FieldMetadataType.TS_VECTOR>;

const callValidator = (
  flatEntityToValidate: UniversalFlatFieldMetadata<FieldMetadataType.TS_VECTOR>,
) =>
  validateTsVectorFlatFieldMetadata({
    flatEntityToValidate,
  } as Parameters<typeof validateTsVectorFlatFieldMetadata>[0]);

const stripUserFriendlyMessage = (errors: FlatFieldMetadataValidationError[]) =>
  errors.map(({ userFriendlyMessage: _, ...rest }) => rest);

describe('validateTsVectorFlatFieldMetadata', () => {
  it('should return no errors for a valid TS_VECTOR field', () => {
    const errors = callValidator(createFlatEntityToValidate());

    expect(errors).toMatchInlineSnapshot('[]');
  });

  it('should return error when name is not "searchVector"', () => {
    const errors = callValidator(
      createFlatEntityToValidate({ name: 'wrongName' }),
    );

    expect(stripUserFriendlyMessage(errors)).toMatchInlineSnapshot(`
[
  {
    "code": "INVALID_FIELD_INPUT",
    "message": "Field type TS_VECTOR must be named "searchVector", got "wrongName"",
    "value": "wrongName",
  },
]
`);
  });

  it('should return error when field is not a system field', () => {
    const errors = callValidator(
      createFlatEntityToValidate({ isSystem: false }),
    );

    expect(stripUserFriendlyMessage(errors)).toMatchInlineSnapshot(`
[
  {
    "code": "INVALID_FIELD_INPUT",
    "message": "Field type TS_VECTOR must be a system field",
    "value": false,
  },
]
`);
  });

  it('should return error when universalSettings has no asExpression', () => {
    const errors = callValidator(
      createFlatEntityToValidate({
        universalSettings: { asExpression: null, generatedType: 'STORED' },
      } as any),
    );

    expect(stripUserFriendlyMessage(errors)).toMatchInlineSnapshot(`
[
  {
    "code": "INVALID_FIELD_INPUT",
    "message": "Field type TS_VECTOR must have an expression. This may have failed to be built because record identifier field does not exist or is not of a searchable type.",
  },
]
`);
  });

  it('should return error when universalSettings is undefined', () => {
    const errors = callValidator(
      createFlatEntityToValidate({
        universalSettings: undefined,
      } as any),
    );

    expect(stripUserFriendlyMessage(errors)).toMatchInlineSnapshot(`
[
  {
    "code": "INVALID_FIELD_INPUT",
    "message": "Field type TS_VECTOR must have an expression. This may have failed to be built because record identifier field does not exist or is not of a searchable type.",
  },
]
`);
  });

  it('should accumulate multiple errors', () => {
    const errors = callValidator(
      createFlatEntityToValidate({
        name: 'badName',
        isSystem: false,
        universalSettings: undefined,
      } as any),
    );

    expect(errors).toHaveLength(3);
    expect(stripUserFriendlyMessage(errors).map((e) => e.code)).toEqual([
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    ]);
  });
});
