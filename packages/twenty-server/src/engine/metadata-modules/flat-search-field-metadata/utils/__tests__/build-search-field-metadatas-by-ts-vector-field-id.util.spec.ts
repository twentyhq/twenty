import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { buildSearchFieldMetadatasByTsVectorFieldId } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-search-field-metadatas-by-ts-vector-field-id.util';
import { getTargetSearchFieldMetadatasForTsVectorField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/get-target-search-field-metadatas-for-ts-vector-field.util';

const buildFlatSearchFieldMetadata = (
  overrides: Partial<FlatSearchFieldMetadata> &
    Pick<FlatSearchFieldMetadata, 'universalIdentifier'>,
): FlatSearchFieldMetadata =>
  ({
    id: overrides.universalIdentifier,
    tsVectorFieldMetadataId: 'ts-vector-1',
    fieldMetadataId: 'field-1',
    position: 0,
    ...overrides,
  }) as unknown as FlatSearchFieldMetadata;

const buildMaps = (
  flatSearchFieldMetadatas: FlatSearchFieldMetadata[],
): FlatEntityMaps<FlatSearchFieldMetadata> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatSearchFieldMetadatas.map((flatSearchFieldMetadata) => [
      flatSearchFieldMetadata.universalIdentifier,
      flatSearchFieldMetadata,
    ]),
  ),
  universalIdentifierById: {},
  universalIdentifiersByApplicationId: {},
});

describe('buildSearchFieldMetadatasByTsVectorFieldId', () => {
  it('groups search fields by their tsVector field id', () => {
    const a1 = buildFlatSearchFieldMetadata({
      universalIdentifier: 'a1',
      tsVectorFieldMetadataId: 'ts-vector-a',
    });
    const a2 = buildFlatSearchFieldMetadata({
      universalIdentifier: 'a2',
      tsVectorFieldMetadataId: 'ts-vector-a',
    });
    const b1 = buildFlatSearchFieldMetadata({
      universalIdentifier: 'b1',
      tsVectorFieldMetadataId: 'ts-vector-b',
    });

    const grouped = buildSearchFieldMetadatasByTsVectorFieldId(
      buildMaps([a1, a2, b1]),
    );

    expect(grouped.get('ts-vector-a')).toEqual([a1, a2]);
    expect(grouped.get('ts-vector-b')).toEqual([b1]);
    expect(grouped.get('ts-vector-unknown')).toBeUndefined();
  });

  it('matches the one-off filter helper for a given tsVector field', () => {
    const maps = buildMaps([
      buildFlatSearchFieldMetadata({
        universalIdentifier: 'a1',
        tsVectorFieldMetadataId: 'ts-vector-a',
      }),
      buildFlatSearchFieldMetadata({
        universalIdentifier: 'b1',
        tsVectorFieldMetadataId: 'ts-vector-b',
      }),
    ]);

    const grouped = buildSearchFieldMetadatasByTsVectorFieldId(maps);

    expect(grouped.get('ts-vector-a')).toEqual(
      getTargetSearchFieldMetadatasForTsVectorField({
        tsVectorFieldMetadataId: 'ts-vector-a',
        flatSearchFieldMetadataMaps: maps,
      }),
    );
  });

  it('ignores undefined map entries', () => {
    const maps = buildMaps([
      buildFlatSearchFieldMetadata({
        universalIdentifier: 'a1',
        tsVectorFieldMetadataId: 'ts-vector-a',
      }),
    ]);

    maps.byUniversalIdentifier['ghost'] = undefined;

    const grouped = buildSearchFieldMetadatasByTsVectorFieldId(maps);

    expect(grouped.get('ts-vector-a')).toHaveLength(1);
    expect(grouped.size).toBe(1);
  });
});
