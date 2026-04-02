import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { validateFlatObjectMetadataIdentifiers } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-identifiers.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';

const buildFieldMaps = (
  entries: Array<{
    universalIdentifier: string;
    type: FieldMetadataType;
  }>,
): UniversalFlatEntityMaps<UniversalFlatFieldMetadata> => ({
  byUniversalIdentifier: Object.fromEntries(
    entries.map((entry) => [
      entry.universalIdentifier,
      {
        universalIdentifier: entry.universalIdentifier,
        type: entry.type,
        name: 'testField',
        label: 'Test Field',
      } as UniversalFlatFieldMetadata,
    ]),
  ),
});

const stripUserFriendlyMessage = (
  errors: FlatObjectMetadataValidationError[],
) => errors.map(({ userFriendlyMessage: _, ...rest }) => rest);

describe('validateFlatObjectMetadataIdentifiers', () => {
  it('should return no errors when both identifiers are null', () => {
    const errors = validateFlatObjectMetadataIdentifiers({
      universalFlatObjectMetadata: {
        labelIdentifierFieldMetadataUniversalIdentifier: null,
        imageIdentifierFieldMetadataUniversalIdentifier: null,
      },
      universalFlatFieldMetadataMaps: buildFieldMaps([]),
    });

    expect(errors).toMatchInlineSnapshot('[]');
  });

  it('should return no errors when label identifier points to a valid TEXT field', () => {
    const errors = validateFlatObjectMetadataIdentifiers({
      universalFlatObjectMetadata: {
        labelIdentifierFieldMetadataUniversalIdentifier: 'field-name',
        imageIdentifierFieldMetadataUniversalIdentifier: null,
      },
      universalFlatFieldMetadataMaps: buildFieldMaps([
        { universalIdentifier: 'field-name', type: FieldMetadataType.TEXT },
      ]),
    });

    expect(errors).toMatchInlineSnapshot('[]');
  });

  it('should return no errors when label identifier points to a valid FULL_NAME field', () => {
    const errors = validateFlatObjectMetadataIdentifiers({
      universalFlatObjectMetadata: {
        labelIdentifierFieldMetadataUniversalIdentifier: 'field-fullname',
        imageIdentifierFieldMetadataUniversalIdentifier: null,
      },
      universalFlatFieldMetadataMaps: buildFieldMaps([
        {
          universalIdentifier: 'field-fullname',
          type: FieldMetadataType.FULL_NAME,
        },
      ]),
    });

    expect(errors).toMatchInlineSnapshot('[]');
  });

  it('should return no errors when label identifier points to a valid UUID field', () => {
    const errors = validateFlatObjectMetadataIdentifiers({
      universalFlatObjectMetadata: {
        labelIdentifierFieldMetadataUniversalIdentifier: 'field-uuid',
        imageIdentifierFieldMetadataUniversalIdentifier: null,
      },
      universalFlatFieldMetadataMaps: buildFieldMaps([
        { universalIdentifier: 'field-uuid', type: FieldMetadataType.UUID },
      ]),
    });

    expect(errors).toMatchInlineSnapshot('[]');
  });

  it('should return error when label identifier field is not found', () => {
    const errors = validateFlatObjectMetadataIdentifiers({
      universalFlatObjectMetadata: {
        labelIdentifierFieldMetadataUniversalIdentifier: 'non-existent',
        imageIdentifierFieldMetadataUniversalIdentifier: null,
      },
      universalFlatFieldMetadataMaps: buildFieldMaps([]),
    });

    expect(stripUserFriendlyMessage(errors)).toMatchInlineSnapshot(`
[
  {
    "code": "INVALID_OBJECT_INPUT",
    "message": "labelIdentifierFieldMetadataUniversalIdentifier validation failed: related field metadata not found",
  },
]
`);
  });

  it('should return error when label identifier field type is not a label identifier type', () => {
    const errors = validateFlatObjectMetadataIdentifiers({
      universalFlatObjectMetadata: {
        labelIdentifierFieldMetadataUniversalIdentifier: 'field-number',
        imageIdentifierFieldMetadataUniversalIdentifier: null,
      },
      universalFlatFieldMetadataMaps: buildFieldMaps([
        {
          universalIdentifier: 'field-number',
          type: FieldMetadataType.NUMBER,
        },
      ]),
    });

    expect(stripUserFriendlyMessage(errors)).toMatchInlineSnapshot(`
[
  {
    "code": "INVALID_OBJECT_INPUT",
    "message": "labelIdentifierFieldMetadataUniversalIdentifier validation failed: field type not compatible",
  },
]
`);
  });

  it('should return error when image identifier field is not found', () => {
    const errors = validateFlatObjectMetadataIdentifiers({
      universalFlatObjectMetadata: {
        labelIdentifierFieldMetadataUniversalIdentifier: null,
        imageIdentifierFieldMetadataUniversalIdentifier: 'non-existent-image',
      },
      universalFlatFieldMetadataMaps: buildFieldMaps([]),
    });

    expect(stripUserFriendlyMessage(errors)).toMatchInlineSnapshot(`
[
  {
    "code": "INVALID_OBJECT_INPUT",
    "message": "imageIdentifierFieldMetadataUniversalIdentifier validation failed: related field metadata not found",
  },
]
`);
  });

  it('should accumulate errors for both label and image identifiers', () => {
    const errors = validateFlatObjectMetadataIdentifiers({
      universalFlatObjectMetadata: {
        labelIdentifierFieldMetadataUniversalIdentifier: 'missing-label',
        imageIdentifierFieldMetadataUniversalIdentifier: 'missing-image',
      },
      universalFlatFieldMetadataMaps: buildFieldMaps([]),
    });

    expect(errors).toHaveLength(2);
    expect(errors.every((e) => e.code === ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT)).toBe(true);
  });
});
