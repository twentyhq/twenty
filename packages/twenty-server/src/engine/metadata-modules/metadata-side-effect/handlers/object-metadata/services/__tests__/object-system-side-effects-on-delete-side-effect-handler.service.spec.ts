import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { ObjectSystemSideEffectsOnDeleteSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-system-side-effects-on-delete-side-effect-handler.service';

const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const OTHER_OBJECT_UNIVERSAL_IDENTIFIER =
  'c1c2c3c4-c5c6-4000-8000-000000000001';

const SYSTEM_FIELD_UNIVERSAL_IDENTIFIER =
  'd1d2d3d4-d5d6-4000-8000-000000000001';
const AUTHOR_FIELD_UNIVERSAL_IDENTIFIER =
  'd1d2d3d4-d5d6-4000-8000-000000000002';
const GIN_INDEX_UNIVERSAL_IDENTIFIER = 'e1e2e3e4-e5e6-4000-8000-000000000001';
const SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER =
  'f1f2f3f4-f5f6-4000-8000-000000000001';

const buildArgs = ({
  relatedFlatEntityMaps,
}: {
  relatedFlatEntityMaps: object;
}): BuildSideEffectsArgs<'objectMetadata'> =>
  ({
    flatEntity: {
      universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    },
    allFlatEntityOperationRecordByMetadataName: {},
    relatedFlatEntityMaps,
    context: {},
  }) as unknown as BuildSideEffectsArgs<'objectMetadata'>;

describe('ObjectSystemSideEffectsOnDeleteSideEffectHandlerService', () => {
  const handler =
    new (ObjectSystemSideEffectsOnDeleteSideEffectHandlerService as unknown as new () => ObjectSystemSideEffectsOnDeleteSideEffectHandlerService)();

  it('should cascade-delete engine-owned fields, indexes and searchFieldMetadata while leaving author fields untouched', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        relatedFlatEntityMaps: {
          flatFieldMetadataMaps: {
            byUniversalIdentifier: {
              [SYSTEM_FIELD_UNIVERSAL_IDENTIFIER]: {
                universalIdentifier: SYSTEM_FIELD_UNIVERSAL_IDENTIFIER,
                isSystemSideEffect: true,
                objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
                relationTargetObjectMetadataUniversalIdentifier: null,
              },
              [AUTHOR_FIELD_UNIVERSAL_IDENTIFIER]: {
                universalIdentifier: AUTHOR_FIELD_UNIVERSAL_IDENTIFIER,
                isSystemSideEffect: false,
                objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
                relationTargetObjectMetadataUniversalIdentifier: null,
              },
            },
          },
          flatIndexMaps: {
            byUniversalIdentifier: {
              [GIN_INDEX_UNIVERSAL_IDENTIFIER]: {
                universalIdentifier: GIN_INDEX_UNIVERSAL_IDENTIFIER,
                isSystemSideEffect: true,
                objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
                universalFlatIndexFieldMetadatas: [],
              },
            },
          },
          flatSearchFieldMetadataMaps: {
            byUniversalIdentifier: {
              [SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER]: {
                universalIdentifier: SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER,
                objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
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

    const deletedFieldUniversalIdentifiers = Object.keys(
      result.operations.fieldMetadata?.flatEntityToDelete ?? {},
    );

    expect(deletedFieldUniversalIdentifiers).toEqual([
      SYSTEM_FIELD_UNIVERSAL_IDENTIFIER,
    ]);
    expect(deletedFieldUniversalIdentifiers).not.toContain(
      AUTHOR_FIELD_UNIVERSAL_IDENTIFIER,
    );
    expect(
      Object.keys(result.operations.index?.flatEntityToDelete ?? {}),
    ).toEqual([GIN_INDEX_UNIVERSAL_IDENTIFIER]);
    expect(
      Object.keys(
        result.operations.searchFieldMetadata?.flatEntityToDelete ?? {},
      ),
    ).toEqual([SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER]);
  });

  it('should cascade-delete the default-relation reverse morph field on a standard object and its join-column index', () => {
    const FORWARD_FIELD_UNIVERSAL_IDENTIFIER =
      'd1d2d3d4-d5d6-4000-8000-000000000003';
    const REVERSE_FIELD_UNIVERSAL_IDENTIFIER =
      'd1d2d3d4-d5d6-4000-8000-000000000004';
    const REVERSE_INDEX_UNIVERSAL_IDENTIFIER =
      'e1e2e3e4-e5e6-4000-8000-000000000002';

    const result = handler.buildSideEffects(
      buildArgs({
        relatedFlatEntityMaps: {
          flatFieldMetadataMaps: {
            byUniversalIdentifier: {
              [FORWARD_FIELD_UNIVERSAL_IDENTIFIER]: {
                universalIdentifier: FORWARD_FIELD_UNIVERSAL_IDENTIFIER,
                isSystemSideEffect: true,
                objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
                relationTargetObjectMetadataUniversalIdentifier:
                  OTHER_OBJECT_UNIVERSAL_IDENTIFIER,
              },
              [REVERSE_FIELD_UNIVERSAL_IDENTIFIER]: {
                universalIdentifier: REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
                isSystemSideEffect: true,
                objectMetadataUniversalIdentifier:
                  OTHER_OBJECT_UNIVERSAL_IDENTIFIER,
                relationTargetObjectMetadataUniversalIdentifier:
                  OBJECT_UNIVERSAL_IDENTIFIER,
              },
            },
          },
          flatIndexMaps: {
            byUniversalIdentifier: {
              [REVERSE_INDEX_UNIVERSAL_IDENTIFIER]: {
                universalIdentifier: REVERSE_INDEX_UNIVERSAL_IDENTIFIER,
                isSystemSideEffect: true,
                objectMetadataUniversalIdentifier:
                  OTHER_OBJECT_UNIVERSAL_IDENTIFIER,
                universalFlatIndexFieldMetadatas: [
                  {
                    fieldMetadataUniversalIdentifier:
                      REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
                  },
                ],
              },
            },
          },
          flatSearchFieldMetadataMaps: { byUniversalIdentifier: {} },
        },
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    expect(
      Object.keys(result.operations.fieldMetadata?.flatEntityToDelete ?? {}),
    ).toEqual([
      FORWARD_FIELD_UNIVERSAL_IDENTIFIER,
      REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
    ]);
    expect(
      Object.keys(result.operations.index?.flatEntityToDelete ?? {}),
    ).toEqual([REVERSE_INDEX_UNIVERSAL_IDENTIFIER]);
  });

  it('should not delete entities belonging to a different object', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        relatedFlatEntityMaps: {
          flatFieldMetadataMaps: {
            byUniversalIdentifier: {
              [SYSTEM_FIELD_UNIVERSAL_IDENTIFIER]: {
                universalIdentifier: SYSTEM_FIELD_UNIVERSAL_IDENTIFIER,
                isSystemSideEffect: true,
                objectMetadataUniversalIdentifier:
                  OTHER_OBJECT_UNIVERSAL_IDENTIFIER,
                relationTargetObjectMetadataUniversalIdentifier: null,
              },
            },
          },
          flatIndexMaps: { byUniversalIdentifier: {} },
          flatSearchFieldMetadataMaps: { byUniversalIdentifier: {} },
        },
      }),
    );

    expect(result.status).toBe('noop');
  });
});
