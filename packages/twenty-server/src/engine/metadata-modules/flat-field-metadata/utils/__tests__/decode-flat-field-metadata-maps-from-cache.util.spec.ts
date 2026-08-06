import { type EncodedFlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/types/encoded-flat-field-metadata-maps.type';
import { decodeFlatFieldMetadataMapsFromCache } from 'src/engine/metadata-modules/flat-field-metadata/utils/decode-flat-field-metadata-maps-from-cache.util';
import { encodeFlatFieldMetadataMapsForCache } from 'src/engine/metadata-modules/flat-field-metadata/utils/encode-flat-field-metadata-maps-for-cache.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const decodeOne = (
  encodedFlatFieldMetadata: Record<string, unknown>,
): Record<string, unknown> =>
  decodeFlatFieldMetadataMapsFromCache({
    byUniversalIdentifier: { 'field-uid': encodedFlatFieldMetadata },
    universalIdentifierById: {},
    universalIdentifiersByApplicationId: {},
  } as EncodedFlatFieldMetadataMaps).byUniversalIdentifier[
    'field-uid'
  ] as unknown as Record<string, unknown>;

describe('decodeFlatFieldMetadataMapsFromCache', () => {
  it('should restore a short code to its full key', () => {
    expect(decodeOne({ $r: 'firstName' })).toMatchObject({
      name: 'firstName',
    });
  });

  it('should restore an omitted relation array as empty', () => {
    expect(decodeOne({})).toMatchObject({ viewFieldIds: [] });
  });

  it('should keep a decoded relation array over the empty default', () => {
    expect(decodeOne({ $H: ['view-field-1'] })).toMatchObject({
      viewFieldIds: ['view-field-1'],
    });
  });

  it('should pass an unmapped key through unchanged', () => {
    expect(decodeOne({ someKeyAddedLater: 'value' })).toMatchObject({
      someKeyAddedLater: 'value',
    });
  });

  it('should keep a null relation array as null instead of restoring the empty default', () => {
    const encoded = encodeFlatFieldMetadataMapsForCache({
      byUniversalIdentifier: { 'field-uid': { viewFieldIds: null } },
      universalIdentifierById: {},
      universalIdentifiersByApplicationId: {},
    } as unknown as FlatEntityMaps<FlatFieldMetadata>);

    expect(
      decodeFlatFieldMetadataMapsFromCache(encoded).byUniversalIdentifier[
        'field-uid'
      ],
    ).toMatchObject({ viewFieldIds: null });
  });

  it('should round trip a field through JSON, as the cache storage layer does', () => {
    const maps = {
      byUniversalIdentifier: {
        'field-uid': {
          name: 'firstName',
          settings: { displayAsRelativeDate: true },
          viewFieldIds: ['view-field-1'],
          viewFilterIds: [],
        },
      },
      universalIdentifierById: { 'field-id': 'field-uid' },
      universalIdentifiersByApplicationId: { 'app-id': ['field-uid'] },
    } as unknown as FlatEntityMaps<FlatFieldMetadata>;

    const encoded = JSON.parse(
      JSON.stringify(encodeFlatFieldMetadataMapsForCache(maps)),
    );

    expect(
      decodeFlatFieldMetadataMapsFromCache(encoded).byUniversalIdentifier[
        'field-uid'
      ],
    ).toMatchObject({
      name: 'firstName',
      settings: { displayAsRelativeDate: true },
      viewFieldIds: ['view-field-1'],
      viewFilterIds: [],
    });
  });
});
