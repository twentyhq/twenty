import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type EncodedFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/encoded-flat-field-metadata-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { encodeFlatFieldMetadataMapsForCache } from 'src/engine/metadata-modules/flat-field-metadata/utils/encode-flat-field-metadata-maps-for-cache.util';

const buildMaps = (
  flatFieldMetadata: Partial<FlatFieldMetadata>,
): FlatEntityMaps<FlatFieldMetadata> => ({
  byUniversalIdentifier: {
    'field-uid': flatFieldMetadata as FlatFieldMetadata,
  },
  universalIdentifierById: {},
  universalIdentifiersByApplicationId: {},
});

const encodeOne = (
  flatFieldMetadata: Partial<FlatFieldMetadata>,
): EncodedFlatFieldMetadata =>
  encodeFlatFieldMetadataMapsForCache(buildMaps(flatFieldMetadata))
    .byUniversalIdentifier['field-uid'];

describe('encodeFlatFieldMetadataMapsForCache', () => {
  it('should replace a mapped key with its short code', () => {
    expect(encodeOne({ name: 'firstName' })).toEqual({ $r: 'firstName' });
  });

  it('should drop a relation array that is empty', () => {
    expect(encodeOne({ viewFieldIds: [] })).toEqual({});
  });

  it('should keep a relation array that is populated', () => {
    expect(encodeOne({ viewFieldIds: ['view-field-1'] })).toEqual({
      $H: ['view-field-1'],
    });
  });

  it('should pass an unmapped key through unchanged', () => {
    expect(
      encodeOne({ someKeyAddedLater: 'value' } as Partial<FlatFieldMetadata>),
    ).toEqual({
      someKeyAddedLater: 'value',
    });
  });

  it('should pass a key inherited from Object.prototype through unchanged', () => {
    expect(
      encodeOne({ constructor: 'value' } as Partial<FlatFieldMetadata>),
    ).toEqual({
      constructor: 'value',
    });
  });
});
