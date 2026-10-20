import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findFlatSearchFieldMetadataIndexingField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/find-flat-search-field-metadata-indexing-field.util';

const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const OTHER_OBJECT_UNIVERSAL_IDENTIFIER =
  'b1b2b3b4-b5b6-4000-8000-000000000002';
const FIELD_UNIVERSAL_IDENTIFIER = 'd1d2d3d4-d5d6-4000-8000-000000000001';
const OTHER_FIELD_UNIVERSAL_IDENTIFIER =
  'd1d2d3d4-d5d6-4000-8000-000000000002';

const buildFlatSearchFieldMetadataMaps = (
  flatSearchFieldMetadatas: {
    universalIdentifier: string;
    fieldMetadataUniversalIdentifier: string;
    objectMetadataUniversalIdentifier: string;
  }[],
): MetadataFlatEntityMaps<'searchFieldMetadata'> =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      flatSearchFieldMetadatas.map((flatSearchFieldMetadata) => [
        flatSearchFieldMetadata.universalIdentifier,
        flatSearchFieldMetadata,
      ]),
    ),
    universalIdentifierById: {},
    universalIdentifiersByApplicationId: {},
  }) as unknown as MetadataFlatEntityMaps<'searchFieldMetadata'>;

describe('findFlatSearchFieldMetadataIndexingField', () => {
  it('finds the row indexing the field of the object', () => {
    const flatSearchFieldMetadataMaps = buildFlatSearchFieldMetadataMaps([
      {
        universalIdentifier: 'f1f2f3f4-f5f6-4000-8000-000000000001',
        fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
        objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      },
    ]);

    const flatSearchFieldMetadata = findFlatSearchFieldMetadataIndexingField({
      flatSearchFieldMetadataMaps,
      fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    });

    expect(flatSearchFieldMetadata?.universalIdentifier).toBe(
      'f1f2f3f4-f5f6-4000-8000-000000000001',
    );
  });

  it('ignores a row indexing the same field for another object', () => {
    const flatSearchFieldMetadataMaps = buildFlatSearchFieldMetadataMaps([
      {
        universalIdentifier: 'f1f2f3f4-f5f6-4000-8000-000000000001',
        fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
        objectMetadataUniversalIdentifier: OTHER_OBJECT_UNIVERSAL_IDENTIFIER,
      },
    ]);

    const flatSearchFieldMetadata = findFlatSearchFieldMetadataIndexingField({
      flatSearchFieldMetadataMaps,
      fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    });

    expect(flatSearchFieldMetadata).toBeUndefined();
  });

  it('ignores a row indexing another field of the object', () => {
    const flatSearchFieldMetadataMaps = buildFlatSearchFieldMetadataMaps([
      {
        universalIdentifier: 'f1f2f3f4-f5f6-4000-8000-000000000001',
        fieldMetadataUniversalIdentifier: OTHER_FIELD_UNIVERSAL_IDENTIFIER,
        objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      },
    ]);

    const flatSearchFieldMetadata = findFlatSearchFieldMetadataIndexingField({
      flatSearchFieldMetadataMaps,
      fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    });

    expect(flatSearchFieldMetadata).toBeUndefined();
  });

  it('returns undefined when no row indexes the field', () => {
    const flatSearchFieldMetadataMaps = buildFlatSearchFieldMetadataMaps([]);

    const flatSearchFieldMetadata = findFlatSearchFieldMetadataIndexingField({
      flatSearchFieldMetadataMaps,
      fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    });

    expect(flatSearchFieldMetadata).toBeUndefined();
  });

  it('ignores undefined map entries', () => {
    const flatSearchFieldMetadataMaps = buildFlatSearchFieldMetadataMaps([
      {
        universalIdentifier: 'f1f2f3f4-f5f6-4000-8000-000000000001',
        fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
        objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      },
    ]);

    flatSearchFieldMetadataMaps.byUniversalIdentifier['ghost'] = undefined;

    const flatSearchFieldMetadata = findFlatSearchFieldMetadataIndexingField({
      flatSearchFieldMetadataMaps,
      fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    });

    expect(flatSearchFieldMetadata?.universalIdentifier).toBe(
      'f1f2f3f4-f5f6-4000-8000-000000000001',
    );
  });
});
