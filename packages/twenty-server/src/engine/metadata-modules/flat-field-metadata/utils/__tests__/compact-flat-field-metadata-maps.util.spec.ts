import { type CompactFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/compact-flat-field-metadata-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { compactFlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/utils/compact-flat-field-metadata-maps.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

const compactOne = (
  flatFieldMetadata: Partial<FlatFieldMetadata>,
): CompactFlatFieldMetadata => {
  const compactedFlatFieldMetadata = compactFlatFieldMetadataMaps({
    byUniversalIdentifier: { 'field-uid': flatFieldMetadata },
    universalIdentifierById: {},
    universalIdentifiersByApplicationId: {},
  }).byUniversalIdentifier['field-uid'];

  jestExpectToBeDefined(compactedFlatFieldMetadata);

  return compactedFlatFieldMetadata;
};

describe('compactFlatFieldMetadataMaps', () => {
  it('should replace a mapped key with its short code', () => {
    expect(compactOne({ name: 'firstName' })).toEqual({ $r: 'firstName' });
  });

  it('should drop a relation array that is empty', () => {
    expect(compactOne({ viewFieldIds: [] })).toEqual({});
  });

  it('should keep a relation array that is populated', () => {
    expect(compactOne({ viewFieldIds: ['view-field-1'] })).toEqual({
      $H: ['view-field-1'],
    });
  });
});
