import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { createSearchFieldMetadatasByTsVectorFieldIdAccessor } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/create-search-field-metadatas-by-ts-vector-field-id-accessor.util';

const buildFlatSearchFieldMetadata = (
  universalIdentifier: string,
  tsVectorFieldMetadataId: string,
): FlatSearchFieldMetadata =>
  ({
    id: universalIdentifier,
    universalIdentifier,
    tsVectorFieldMetadataId,
    fieldMetadataId: `field-${universalIdentifier}`,
    position: 0,
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

describe('createSearchFieldMetadatasByTsVectorFieldIdAccessor', () => {
  it('resolves the search fields for a tsVector field', () => {
    const maps = buildMaps([
      buildFlatSearchFieldMetadata('a1', 'ts-vector-a'),
      buildFlatSearchFieldMetadata('a2', 'ts-vector-a'),
      buildFlatSearchFieldMetadata('b1', 'ts-vector-b'),
    ]);

    const accessor = createSearchFieldMetadatasByTsVectorFieldIdAccessor(
      () => maps,
    );

    expect(accessor.get('ts-vector-a')).toHaveLength(2);
    expect(accessor.get('ts-vector-b')).toHaveLength(1);
    expect(accessor.get('ts-vector-unknown')).toEqual([]);
  });

  it('serves a stale result after the map changes until invalidate() is called', () => {
    const maps = buildMaps([buildFlatSearchFieldMetadata('a1', 'ts-vector-a')]);

    const accessor = createSearchFieldMetadatasByTsVectorFieldIdAccessor(
      () => maps,
    );

    expect(accessor.get('ts-vector-a')).toHaveLength(1);

    maps.byUniversalIdentifier['a2'] = buildFlatSearchFieldMetadata(
      'a2',
      'ts-vector-a',
    );

    expect(accessor.get('ts-vector-a')).toHaveLength(1);

    accessor.invalidate();

    expect(accessor.get('ts-vector-a')).toHaveLength(2);
  });

  it('rebuilds against the latest maps reference returned by the getter', () => {
    let maps = buildMaps([buildFlatSearchFieldMetadata('a1', 'ts-vector-a')]);

    const accessor = createSearchFieldMetadatasByTsVectorFieldIdAccessor(
      () => maps,
    );

    expect(accessor.get('ts-vector-a')).toHaveLength(1);

    maps = buildMaps([
      buildFlatSearchFieldMetadata('a1', 'ts-vector-a'),
      buildFlatSearchFieldMetadata('a2', 'ts-vector-a'),
    ]);

    accessor.invalidate();

    expect(accessor.get('ts-vector-a')).toHaveLength(2);
  });
});
