import { ObjectSystemSideEffectsOnDeleteSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-system-side-effects-on-delete-side-effect-handler.service';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';

const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const OTHER_OBJECT_UNIVERSAL_IDENTIFIER =
  'c1c2c3c4-c5c6-4000-8000-000000000001';

const SYSTEM_FIELD_UNIVERSAL_IDENTIFIER =
  'd1d2d3d4-d5d6-4000-8000-000000000001';
const AUTHOR_FIELD_UNIVERSAL_IDENTIFIER =
  'd1d2d3d4-d5d6-4000-8000-000000000002';
const FORWARD_FIELD_UNIVERSAL_IDENTIFIER =
  'd1d2d3d4-d5d6-4000-8000-000000000003';
const REVERSE_FIELD_UNIVERSAL_IDENTIFIER =
  'd1d2d3d4-d5d6-4000-8000-000000000004';
const GIN_INDEX_UNIVERSAL_IDENTIFIER = 'e1e2e3e4-e5e6-4000-8000-000000000001';
const REVERSE_INDEX_UNIVERSAL_IDENTIFIER =
  'e1e2e3e4-e5e6-4000-8000-000000000002';
const SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER =
  'f1f2f3f4-f5f6-4000-8000-000000000001';
const INDEX_VIEW_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  'a1a2a3a4-a5a6-4000-8000-000000000002';
const CALLER_VIEW_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000003';
const CALLER_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  'a1a2a3a4-a5a6-4000-8000-000000000004';

type FieldFixture = {
  universalIdentifier: string;
  isSystemSideEffect: boolean;
  objectMetadataUniversalIdentifier?: string;
  relationTargetFieldMetadataUniversalIdentifier?: string | null;
  viewFieldUniversalIdentifiers?: string[];
};

type ViewFixture = {
  universalIdentifier: string;
  isSystemSideEffect: boolean;
  viewFieldUniversalIdentifiers?: string[];
};

const buildFieldMetadataMaps = (fields: FieldFixture[]) => ({
  byUniversalIdentifier: Object.fromEntries(
    fields.map((field) => [
      field.universalIdentifier,
      {
        objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
        relationTargetFieldMetadataUniversalIdentifier: null,
        viewFieldUniversalIdentifiers: [],
        ...field,
      },
    ]),
  ),
});

const buildArgs = ({
  fieldUniversalIdentifiers = [],
  indexMetadataUniversalIdentifiers = [],
  searchFieldMetadataUniversalIdentifiers = [],
  viewUniversalIdentifiers = [],
  relatedFlatEntityMaps = {},
}: {
  fieldUniversalIdentifiers?: string[];
  indexMetadataUniversalIdentifiers?: string[];
  searchFieldMetadataUniversalIdentifiers?: string[];
  viewUniversalIdentifiers?: string[];
  relatedFlatEntityMaps?: object;
}): BuildSideEffectsArgs<'objectMetadata'> =>
  ({
    flatEntity: {
      universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifiers,
      indexMetadataUniversalIdentifiers,
      searchFieldMetadataUniversalIdentifiers,
      viewUniversalIdentifiers,
    },
    allFlatEntityOperationRecordByMetadataName: {},
    relatedFlatEntityMaps: {
      flatObjectMetadataMaps: { byUniversalIdentifier: {} },
      flatFieldMetadataMaps: { byUniversalIdentifier: {} },
      flatIndexMaps: { byUniversalIdentifier: {} },
      flatSearchFieldMetadataMaps: { byUniversalIdentifier: {} },
      flatViewMaps: { byUniversalIdentifier: {} },
      flatViewFieldMaps: { byUniversalIdentifier: {} },
      ...relatedFlatEntityMaps,
    },
    context: {},
  }) as unknown as BuildSideEffectsArgs<'objectMetadata'>;

describe('ObjectSystemSideEffectsOnDeleteSideEffectHandlerService', () => {
  const handler =
    new (ObjectSystemSideEffectsOnDeleteSideEffectHandlerService as unknown as new () => ObjectSystemSideEffectsOnDeleteSideEffectHandlerService)();

  it('should cascade-delete engine-owned fields, indexes and searchFieldMetadata while leaving author fields untouched', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        fieldUniversalIdentifiers: [
          SYSTEM_FIELD_UNIVERSAL_IDENTIFIER,
          AUTHOR_FIELD_UNIVERSAL_IDENTIFIER,
        ],
        indexMetadataUniversalIdentifiers: [GIN_INDEX_UNIVERSAL_IDENTIFIER],
        searchFieldMetadataUniversalIdentifiers: [
          SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER,
        ],
        relatedFlatEntityMaps: {
          flatFieldMetadataMaps: buildFieldMetadataMaps([
            {
              universalIdentifier: SYSTEM_FIELD_UNIVERSAL_IDENTIFIER,
              isSystemSideEffect: true,
            },
            {
              universalIdentifier: AUTHOR_FIELD_UNIVERSAL_IDENTIFIER,
              isSystemSideEffect: false,
            },
          ]),
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
    const result = handler.buildSideEffects(
      buildArgs({
        fieldUniversalIdentifiers: [FORWARD_FIELD_UNIVERSAL_IDENTIFIER],
        relatedFlatEntityMaps: {
          flatObjectMetadataMaps: {
            byUniversalIdentifier: {
              [OTHER_OBJECT_UNIVERSAL_IDENTIFIER]: {
                universalIdentifier: OTHER_OBJECT_UNIVERSAL_IDENTIFIER,
                indexMetadataUniversalIdentifiers: [
                  REVERSE_INDEX_UNIVERSAL_IDENTIFIER,
                ],
              },
            },
          },
          flatFieldMetadataMaps: buildFieldMetadataMaps([
            {
              universalIdentifier: FORWARD_FIELD_UNIVERSAL_IDENTIFIER,
              isSystemSideEffect: true,
              relationTargetFieldMetadataUniversalIdentifier:
                REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
            },
            {
              universalIdentifier: REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
              isSystemSideEffect: true,
              objectMetadataUniversalIdentifier:
                OTHER_OBJECT_UNIVERSAL_IDENTIFIER,
            },
          ]),
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

  it('should not delete entities the object aggregators do not reference', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        relatedFlatEntityMaps: {
          flatFieldMetadataMaps: buildFieldMetadataMaps([
            {
              universalIdentifier: SYSTEM_FIELD_UNIVERSAL_IDENTIFIER,
              isSystemSideEffect: true,
              objectMetadataUniversalIdentifier:
                OTHER_OBJECT_UNIVERSAL_IDENTIFIER,
            },
          ]),
        },
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('should cascade-delete the engine-owned INDEX view and its view fields while leaving a caller-owned view untouched', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        viewUniversalIdentifiers: [
          INDEX_VIEW_UNIVERSAL_IDENTIFIER,
          CALLER_VIEW_UNIVERSAL_IDENTIFIER,
        ],
        relatedFlatEntityMaps: {
          flatViewMaps: {
            byUniversalIdentifier: Object.fromEntries(
              (
                [
                  {
                    universalIdentifier: INDEX_VIEW_UNIVERSAL_IDENTIFIER,
                    isSystemSideEffect: true,
                    viewFieldUniversalIdentifiers: [
                      INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
                    ],
                  },
                  {
                    universalIdentifier: CALLER_VIEW_UNIVERSAL_IDENTIFIER,
                    isSystemSideEffect: false,
                    viewFieldUniversalIdentifiers: [
                      CALLER_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
                    ],
                  },
                ] satisfies ViewFixture[]
              ).map((view) => [view.universalIdentifier, view]),
            ),
          },
          flatViewFieldMaps: {
            byUniversalIdentifier: {
              [INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER]: {
                universalIdentifier: INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
                isSystemSideEffect: true,
              },
              [CALLER_VIEW_FIELD_UNIVERSAL_IDENTIFIER]: {
                universalIdentifier: CALLER_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
                isSystemSideEffect: false,
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
      Object.keys(result.operations.view?.flatEntityToDelete ?? {}),
    ).toEqual([INDEX_VIEW_UNIVERSAL_IDENTIFIER]);
    expect(
      Object.keys(result.operations.viewField?.flatEntityToDelete ?? {}),
    ).toEqual([INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER]);
  });

  it('should cascade-delete a system view field of a deleted field even when it lives on another object view', () => {
    const OTHER_OBJECT_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
      'a1a2a3a4-a5a6-4000-8000-000000000006';

    const result = handler.buildSideEffects(
      buildArgs({
        fieldUniversalIdentifiers: [FORWARD_FIELD_UNIVERSAL_IDENTIFIER],
        relatedFlatEntityMaps: {
          flatFieldMetadataMaps: buildFieldMetadataMaps([
            {
              universalIdentifier: FORWARD_FIELD_UNIVERSAL_IDENTIFIER,
              isSystemSideEffect: true,
              relationTargetFieldMetadataUniversalIdentifier:
                REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
            },
            {
              universalIdentifier: REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
              isSystemSideEffect: true,
              objectMetadataUniversalIdentifier:
                OTHER_OBJECT_UNIVERSAL_IDENTIFIER,
              viewFieldUniversalIdentifiers: [
                OTHER_OBJECT_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
              ],
            },
          ]),
          flatViewFieldMaps: {
            byUniversalIdentifier: {
              [OTHER_OBJECT_VIEW_FIELD_UNIVERSAL_IDENTIFIER]: {
                universalIdentifier:
                  OTHER_OBJECT_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
                isSystemSideEffect: true,
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

    expect(result.operations.view).toBeUndefined();
    expect(
      Object.keys(result.operations.viewField?.flatEntityToDelete ?? {}),
    ).toEqual([OTHER_OBJECT_VIEW_FIELD_UNIVERSAL_IDENTIFIER]);
  });
});
