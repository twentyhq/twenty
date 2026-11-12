import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { createSearchFieldMetadatasByTsVectorFieldIdAccessor } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/create-search-field-metadatas-by-ts-vector-field-id-accessor.util';

const buildFlatSearchFieldMetadata = (
  universalIdentifier: string,
  tsVectorFieldMetadataId: string,
): FlatSearchFieldMetadata => ({
  id: universalIdentifier,
  universalIdentifier,
  tsVectorFieldMetadataId,
  tsVectorFieldMetadataUniversalIdentifier: tsVectorFieldMetadataId,
  fieldMetadataId: `field-${universalIdentifier}`,
  fieldMetadataUniversalIdentifier: `field-${universalIdentifier}`,
  position: 0,
  objectMetadataId: 'object-metadata-id',
  objectMetadataUniversalIdentifier: 'object-metadata-universal-identifier',
  isSystemSideEffect: false,
  workspaceId: 'workspace-id',
  applicationId: 'application-id',
  applicationUniversalIdentifier: 'application-universal-identifier',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

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
