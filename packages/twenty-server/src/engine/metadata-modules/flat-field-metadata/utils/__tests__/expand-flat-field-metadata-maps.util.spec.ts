import { type CompactFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/compact-flat-field-metadata-maps.type';
import { compactFlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/utils/compact-flat-field-metadata-maps.util';
import { expandFlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/utils/expand-flat-field-metadata-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const expandOne = (
  compactFlatFieldMetadata: CompactFlatFieldMetadata,
): Partial<FlatFieldMetadata> | undefined =>
  expandFlatFieldMetadataMaps({
    byUniversalIdentifier: { 'field-uid': compactFlatFieldMetadata },
    universalIdentifierById: {},
    universalIdentifiersByApplicationId: {},
  }).byUniversalIdentifier['field-uid'];

const compactOne = (flatFieldMetadata: Partial<FlatFieldMetadata>) =>
  compactFlatFieldMetadataMaps({
    byUniversalIdentifier: { 'field-uid': flatFieldMetadata },
    universalIdentifierById: {},
    universalIdentifiersByApplicationId: {},
  });

describe('expandFlatFieldMetadataMaps', () => {
  it('should restore a short code to its full key', () => {
    expect(expandOne({ $r: 'firstName' })).toMatchObject({
      name: 'firstName',
    });
  });

  it('should restore an omitted relation array as empty', () => {
    expect(expandOne({})).toMatchObject({ viewFieldIds: [] });
  });

  it('should keep an expanded relation array over the empty default', () => {
    expect(expandOne({ $H: ['view-field-1'] })).toMatchObject({
      viewFieldIds: ['view-field-1'],
    });
  });

  it('should round trip a field through JSON, as the cache storage layer does', () => {
    const compacted = JSON.parse(
      JSON.stringify(
        compactOne({
          name: 'firstName',
          viewFieldIds: ['view-field-1'],
          viewFilterIds: [],
        }),
      ),
    );

    expect(
      expandFlatFieldMetadataMaps(compacted).byUniversalIdentifier,
    ).toMatchObject({
      'field-uid': {
        name: 'firstName',
        viewFieldIds: ['view-field-1'],
        viewFilterIds: [],
      },
    });
  });
});
