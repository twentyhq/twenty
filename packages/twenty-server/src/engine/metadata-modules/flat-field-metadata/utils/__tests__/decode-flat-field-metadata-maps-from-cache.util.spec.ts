import { type EncodedFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/encoded-flat-field-metadata-maps.type';
import { decodeFlatFieldMetadataMapsFromCache } from 'src/engine/metadata-modules/flat-field-metadata/utils/decode-flat-field-metadata-maps-from-cache.util';
import { encodeFlatFieldMetadataMapsForCache } from 'src/engine/metadata-modules/flat-field-metadata/utils/encode-flat-field-metadata-maps-for-cache.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const decodeOne = (
  encodedFlatFieldMetadata: EncodedFlatFieldMetadata,
): Partial<FlatFieldMetadata> | undefined =>
  decodeFlatFieldMetadataMapsFromCache({
    byUniversalIdentifier: { 'field-uid': encodedFlatFieldMetadata },
    universalIdentifierById: {},
    universalIdentifiersByApplicationId: {},
  }).byUniversalIdentifier['field-uid'];

const encodeOne = (flatFieldMetadata: Partial<FlatFieldMetadata>) =>
  encodeFlatFieldMetadataMapsForCache({
    byUniversalIdentifier: { 'field-uid': flatFieldMetadata },
    universalIdentifierById: {},
    universalIdentifiersByApplicationId: {},
  });

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

  it('should be idempotent, so decoding a payload that was never encoded is safe', () => {
    const decodedOnce = decodeFlatFieldMetadataMapsFromCache(
      encodeOne({
        name: 'firstName',
        viewFieldIds: ['view-field-1'],
        viewFilterIds: [],
      }),
    );

    expect(decodeFlatFieldMetadataMapsFromCache(decodedOnce)).toEqual(
      decodedOnce,
    );
  });

  it('should round trip a field through JSON, as the cache storage layer does', () => {
    const encoded = JSON.parse(
      JSON.stringify(
        encodeOne({
          name: 'firstName',
          viewFieldIds: ['view-field-1'],
          viewFilterIds: [],
        }),
      ),
    );

    expect(
      decodeFlatFieldMetadataMapsFromCache(encoded).byUniversalIdentifier,
    ).toMatchObject({
      'field-uid': {
        name: 'firstName',
        viewFieldIds: ['view-field-1'],
        viewFilterIds: [],
      },
    });
  });
});
