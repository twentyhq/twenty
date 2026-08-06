import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  decodeFlatFieldMetadataMapsFromCache,
  encodeFlatFieldMetadataMapsForCache,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/flat-field-metadata-cache-codec.util';

const buildFlatFieldMetadata = (
  overrides: Partial<Record<string, unknown>> = {},
): FlatFieldMetadata =>
  ({
    id: 'field-id',
    universalIdentifier: 'field-uid',
    name: 'firstName',
    label: 'First Name',
    type: 'TEXT',
    settings: null,
    options: null,
    isActive: true,
    isUnique: false,
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    calendarEndViewIds: [],
    mainGroupByFieldMetadataViewIds: [],
    viewFieldIds: [],
    viewFilterIds: [],
    fieldPermissionIds: [],
    viewFieldUniversalIdentifiers: [],
    viewFilterUniversalIdentifiers: [],
    kanbanAggregateOperationViewUniversalIdentifiers: [],
    calendarViewUniversalIdentifiers: [],
    calendarEndViewUniversalIdentifiers: [],
    mainGroupByFieldMetadataViewUniversalIdentifiers: [],
    viewSortIds: [],
    viewSortUniversalIdentifiers: [],
    searchFieldMetadataIds: [],
    searchFieldMetadataUniversalIdentifiers: [],
    fieldPermissionUniversalIdentifiers: [],
    ...overrides,
  }) as unknown as FlatFieldMetadata;

const buildMaps = (
  flatFieldMetadatas: Record<string, FlatFieldMetadata>,
): FlatEntityMaps<FlatFieldMetadata> => ({
  byUniversalIdentifier: flatFieldMetadatas,
  universalIdentifierById: { 'field-id': 'field-uid' },
  universalIdentifiersByApplicationId: { 'app-id': ['field-uid'] },
});

describe('flatFieldMetadataCacheCodec', () => {
  it('should restore the original maps when every relation array is empty', () => {
    const maps = buildMaps({ 'field-uid': buildFlatFieldMetadata() });

    expect(
      decodeFlatFieldMetadataMapsFromCache(
        encodeFlatFieldMetadataMapsForCache(maps),
      ),
    ).toEqual(maps);
  });

  it('should restore the original maps when relation arrays are populated', () => {
    const maps = buildMaps({
      'field-uid': buildFlatFieldMetadata({
        viewFieldIds: ['view-field-1', 'view-field-2'],
        viewFieldUniversalIdentifiers: ['view-field-uid-1', 'view-field-uid-2'],
        searchFieldMetadataIds: ['search-1'],
      }),
    });

    expect(
      decodeFlatFieldMetadataMapsFromCache(
        encodeFlatFieldMetadataMapsForCache(maps),
      ),
    ).toEqual(maps);
  });

  it('should survive a JSON round trip, as the cache storage layer performs', () => {
    const maps = buildMaps({
      'field-uid': buildFlatFieldMetadata({ viewFilterIds: ['filter-1'] }),
      'other-uid': buildFlatFieldMetadata({
        id: 'other-id',
        universalIdentifier: 'other-uid',
        settings: { displayAsRelativeDate: true },
      }),
    });

    const encoded = JSON.parse(
      JSON.stringify(encodeFlatFieldMetadataMapsForCache(maps)),
    );

    expect(decodeFlatFieldMetadataMapsFromCache(encoded)).toEqual(maps);
  });

  it('should omit empty relation arrays and short-code every key it keeps', () => {
    const encoded = encodeFlatFieldMetadataMapsForCache(
      buildMaps({
        'field-uid': buildFlatFieldMetadata({ viewFieldIds: ['view-field-1'] }),
      }),
    );
    const encodedFlatFieldMetadata = encoded.byUniversalIdentifier['field-uid'];

    expect(encodedFlatFieldMetadata).not.toHaveProperty('viewFieldIds');
    expect(encodedFlatFieldMetadata).not.toHaveProperty('viewFilterIds');
    expect(encodedFlatFieldMetadata).not.toHaveProperty('name');
    expect(encodedFlatFieldMetadata.$H).toEqual(['view-field-1']);
    expect(encodedFlatFieldMetadata.$r).toBe('firstName');
  });

  it('should pass through a key that has no short code, in both directions', () => {
    const maps = buildMaps({
      'field-uid': buildFlatFieldMetadata({ someKeyAddedLater: 'value' }),
    });

    const encoded = encodeFlatFieldMetadataMapsForCache(maps);

    expect(encoded.byUniversalIdentifier['field-uid'].someKeyAddedLater).toBe(
      'value',
    );
    expect(decodeFlatFieldMetadataMapsFromCache(encoded)).toEqual(maps);
  });

  it('should shrink the serialized payload', () => {
    const maps = buildMaps({ 'field-uid': buildFlatFieldMetadata() });

    const rawSize = JSON.stringify(maps).length;
    const encodedSize = JSON.stringify(
      encodeFlatFieldMetadataMapsForCache(maps),
    ).length;

    expect(encodedSize).toBeLessThan(rawSize * 0.5);
  });
});
