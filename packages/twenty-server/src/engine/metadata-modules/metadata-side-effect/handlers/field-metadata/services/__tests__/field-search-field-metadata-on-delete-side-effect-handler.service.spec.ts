import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { FieldSearchFieldMetadataOnDeleteSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-search-field-metadata-on-delete-side-effect-handler.service';

const DELETED_FIELD_UNIVERSAL_IDENTIFIER =
  'd1d2d3d4-d5d6-4000-8000-000000000001';
const OTHER_FIELD_UNIVERSAL_IDENTIFIER = 'd1d2d3d4-d5d6-4000-8000-000000000002';
const SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER =
  'f1f2f3f4-f5f6-4000-8000-000000000001';
const OTHER_SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER =
  'f1f2f3f4-f5f6-4000-8000-000000000002';

const buildArgs = ({
  searchFieldMetadataUniversalIdentifiers,
  relatedFlatEntityMaps,
}: {
  searchFieldMetadataUniversalIdentifiers: string[];
  relatedFlatEntityMaps: object;
}): BuildSideEffectsArgs<'fieldMetadata'> =>
  ({
    flatEntity: {
      universalIdentifier: DELETED_FIELD_UNIVERSAL_IDENTIFIER,
      searchFieldMetadataUniversalIdentifiers,
    },
    allFlatEntityOperationRecordByMetadataName: {},
    relatedFlatEntityMaps,
    context: {},
  }) as unknown as BuildSideEffectsArgs<'fieldMetadata'>;

describe('FieldSearchFieldMetadataOnDeleteSideEffectHandlerService', () => {
  const handler =
    new (FieldSearchFieldMetadataOnDeleteSideEffectHandlerService as unknown as new () => FieldSearchFieldMetadataOnDeleteSideEffectHandlerService)();

  it('should cascade-delete every searchFieldMetadata row indexing the deleted field', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        searchFieldMetadataUniversalIdentifiers: [
          SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER,
        ],
        relatedFlatEntityMaps: {
          flatSearchFieldMetadataMaps: {
            byUniversalIdentifier: {
              [SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER]: {
                universalIdentifier: SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER,
                fieldMetadataUniversalIdentifier:
                  DELETED_FIELD_UNIVERSAL_IDENTIFIER,
              },
            },
          },
        },
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    expect(
      Object.keys(
        result.operations.searchFieldMetadata?.flatEntityToDelete ?? {},
      ),
    ).toEqual([SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER]);
  });

  it('should not delete searchFieldMetadata rows indexing a different field', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        searchFieldMetadataUniversalIdentifiers: [],
        relatedFlatEntityMaps: {
          flatSearchFieldMetadataMaps: {
            byUniversalIdentifier: {
              [OTHER_SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER]: {
                universalIdentifier:
                  OTHER_SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER,
                fieldMetadataUniversalIdentifier:
                  OTHER_FIELD_UNIVERSAL_IDENTIFIER,
              },
            },
          },
        },
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('should be a noop when the workspace has no searchFieldMetadata rows', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        searchFieldMetadataUniversalIdentifiers: [
          SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER,
        ],
        relatedFlatEntityMaps: {
          flatSearchFieldMetadataMaps: { byUniversalIdentifier: {} },
        },
      }),
    );

    expect(result.status).toBe('noop');
  });
});
