import { FlatEntityMapsException } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type CompactFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/compact-flat-field-metadata-maps.type';
import { compactFlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/utils/compact-flat-field-metadata-maps.util';
import { expandFlatFieldMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/expand-flat-field-metadata-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const expandOne = (
  compactFlatFieldMetadata: CompactFlatFieldMetadata,
): Partial<FlatFieldMetadata> | undefined =>
  expandFlatFieldMetadataMapsOrThrow({
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

describe('expandFlatFieldMetadataMapsOrThrow', () => {
  it('should restore a short code to its full key', () => {
    expect(expandOne({ $r: 'firstName', isSearchable: false })).toMatchObject({
      name: 'firstName',
    });
  });

  it('should restore an omitted relation array as empty', () => {
    expect(expandOne({ isSearchable: false })).toMatchObject({
      viewFieldIds: [],
    });
  });

  it('should keep an expanded relation array over the empty default', () => {
    expect(
      expandOne({ $H: ['view-field-1'], isSearchable: false }),
    ).toMatchObject({
      viewFieldIds: ['view-field-1'],
    });
  });

  it('should keep a cached isSearchable whether true or false', () => {
    expect(expandOne({ isSearchable: true })).toMatchObject({
      isSearchable: true,
    });
    expect(expandOne({ isSearchable: false })).toMatchObject({
      isSearchable: false,
    });
  });

  it('should throw on an entry cached before isSearchable existed', () => {
    expect(() => expandOne({ $B: ['search-field-1'] })).toThrow(
      FlatEntityMapsException,
    );
  });

  it('should round trip a field through JSON, as the cache storage layer does', () => {
    const compacted = JSON.parse(
      JSON.stringify(
        compactOne({
          name: 'firstName',
          isSearchable: false,
          viewFieldIds: ['view-field-1'],
          viewFilterIds: [],
        }),
      ),
    );

    expect(
      expandFlatFieldMetadataMapsOrThrow(compacted).byUniversalIdentifier,
    ).toMatchObject({
      'field-uid': {
        name: 'firstName',
        isSearchable: false,
        viewFieldIds: ['view-field-1'],
        viewFilterIds: [],
      },
    });
  });
});
