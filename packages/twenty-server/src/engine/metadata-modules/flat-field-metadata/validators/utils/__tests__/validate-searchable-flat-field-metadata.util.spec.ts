import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { validateSearchableFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-searchable-flat-field-metadata.util';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const FIELD_UNIVERSAL_IDENTIFIER = 'd1d2d3d4-d5d6-4000-8000-000000000001';

const TS_VECTOR_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: SEARCH_VECTOR_FIELD.name,
});

const flatFieldMetadataToValidate = {
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'city',
  type: FieldMetadataType.TEXT,
  isSearchable: true,
} as UniversalFlatFieldMetadata;

const flatObjectMetadata = {
  isSearchable: true,
  universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  fieldUniversalIdentifiers: [FIELD_UNIVERSAL_IDENTIFIER],
  labelIdentifierFieldMetadataUniversalIdentifier: 'some-other-field',
};

const buildFlatFieldMetadataMaps = (
  tsVectorFieldUniversalIdentifier?: string,
): MetadataUniversalFlatEntityMaps<'fieldMetadata'> =>
  ({
    byUniversalIdentifier:
      tsVectorFieldUniversalIdentifier === undefined
        ? {}
        : {
            [tsVectorFieldUniversalIdentifier]: {
              universalIdentifier: tsVectorFieldUniversalIdentifier,
              objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
              name: SEARCH_VECTOR_FIELD.name,
              type: FieldMetadataType.TS_VECTOR,
            },
          },
  }) as unknown as MetadataUniversalFlatEntityMaps<'fieldMetadata'>;

describe('validateSearchableFlatFieldMetadata', () => {
  it('should accept a search vector still pending creation in the same batch', () => {
    const errors = validateSearchableFlatFieldMetadata({
      flatFieldMetadataToValidate,
      flatObjectMetadata,
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps(),
      remainingFlatFieldMetadataMaps: buildFlatFieldMetadataMaps(
        TS_VECTOR_FIELD_UNIVERSAL_IDENTIFIER,
      ),
    });

    expect(errors).toEqual([]);
  });

  it('should reject when no search vector exists in either map', () => {
    const errors = validateSearchableFlatFieldMetadata({
      flatFieldMetadataToValidate,
      flatObjectMetadata,
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps(),
      remainingFlatFieldMetadataMaps: buildFlatFieldMetadataMaps(),
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(
      'Object has no search vector field, in both existing and about to be created field metadatas',
    );
  });

  it('should ignore a pending search vector provisioned for another object', () => {
    const errors = validateSearchableFlatFieldMetadata({
      flatFieldMetadataToValidate,
      flatObjectMetadata,
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps(),
      remainingFlatFieldMetadataMaps: buildFlatFieldMetadataMaps(
        getFieldUniversalIdentifier({
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          objectUniversalIdentifier: 'another-object',
          name: SEARCH_VECTOR_FIELD.name,
        }),
      ),
    });

    expect(errors).toHaveLength(1);
  });

  it('should accept a search vector already committed on the object', () => {
    const errors = validateSearchableFlatFieldMetadata({
      flatFieldMetadataToValidate,
      flatObjectMetadata: {
        ...flatObjectMetadata,
        fieldUniversalIdentifiers: [
          FIELD_UNIVERSAL_IDENTIFIER,
          TS_VECTOR_FIELD_UNIVERSAL_IDENTIFIER,
        ],
      },
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps(
        TS_VECTOR_FIELD_UNIVERSAL_IDENTIFIER,
      ),
    });

    expect(errors).toEqual([]);
  });

  it('should reject without remaining maps when the object has no search vector', () => {
    const errors = validateSearchableFlatFieldMetadata({
      flatFieldMetadataToValidate,
      flatObjectMetadata,
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps(),
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('Object has no search vector field');
  });
});
