import { FieldMetadataType } from 'twenty-shared/types';

import { FieldSearchFieldMetadataOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-search-field-metadata-on-create-side-effect-handler.service';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const FIELD_UNIVERSAL_IDENTIFIER = 'd1d2d3d4-d5d6-4000-8000-000000000001';
const TS_VECTOR_FIELD_UNIVERSAL_IDENTIFIER =
  'd1d2d3d4-d5d6-4000-8000-000000000002';
const EXISTING_SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER =
  'f1f2f3f4-f5f6-4000-8000-000000000001';

const buildArgs = ({
  isSearchable,
  isSystemBuild = false,
  isLabelIdentifier = false,
  hasTsVectorField = true,
  objectSearchFieldMetadatas = {},
  pendingSearchFieldMetadataCreatesByFieldUniversalIdentifier = {},
}: {
  isSearchable: boolean;
  isSystemBuild?: boolean;
  isLabelIdentifier?: boolean;
  hasTsVectorField?: boolean;
  objectSearchFieldMetadatas?: Record<string, { position: number }>;
  pendingSearchFieldMetadataCreatesByFieldUniversalIdentifier?: Record<
    string,
    { position: number }
  >;
}): BuildSideEffectsArgs<'fieldMetadata'> =>
  ({
    flatEntity: {
      universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      name: 'city',
      type: FieldMetadataType.TEXT,
      isSearchable,
    },
    allFlatEntityOperationRecordByMetadataName: {
      searchFieldMetadata: {
        flatEntityToCreate: Object.fromEntries(
          Object.entries(
            pendingSearchFieldMetadataCreatesByFieldUniversalIdentifier,
          ).map(([fieldMetadataUniversalIdentifier, { position }], index) => [
            `pending-${index}`,
            {
              universalIdentifier: `pending-${index}`,
              position,
              objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
              fieldMetadataUniversalIdentifier,
            },
          ]),
        ),
        flatEntityToUpdate: {},
        flatEntityToDelete: {},
      },
    },
    relatedFlatEntityMaps: {
      flatFieldMetadataMaps: {
        byUniversalIdentifier: {
          ...(hasTsVectorField
            ? {
                [TS_VECTOR_FIELD_UNIVERSAL_IDENTIFIER]: {
                  universalIdentifier: TS_VECTOR_FIELD_UNIVERSAL_IDENTIFIER,
                  type: FieldMetadataType.TS_VECTOR,
                  name: 'searchVector',
                },
              }
            : {}),
        },
      },
      flatObjectMetadataMaps: {
        byUniversalIdentifier: {
          [OBJECT_UNIVERSAL_IDENTIFIER]: {
            universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
            applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
            labelIdentifierFieldMetadataUniversalIdentifier: isLabelIdentifier
              ? FIELD_UNIVERSAL_IDENTIFIER
              : undefined,
            fieldUniversalIdentifiers: [
              FIELD_UNIVERSAL_IDENTIFIER,
              ...(hasTsVectorField
                ? [TS_VECTOR_FIELD_UNIVERSAL_IDENTIFIER]
                : []),
            ],
            searchFieldMetadataUniversalIdentifiers: Object.keys(
              objectSearchFieldMetadatas,
            ),
          },
        },
      },
      flatSearchFieldMetadataMaps: {
        byUniversalIdentifier: Object.fromEntries(
          Object.entries(objectSearchFieldMetadatas).map(
            ([universalIdentifier, { position }]) => [
              universalIdentifier,
              {
                universalIdentifier,
                position,
                fieldMetadataUniversalIdentifier: 'some-other-field',
              },
            ],
          ),
        ),
      },
    },
    context: { buildOptions: { isSystemBuild } },
  }) as unknown as BuildSideEffectsArgs<'fieldMetadata'>;

describe('FieldSearchFieldMetadataOnCreateSideEffectHandlerService', () => {
  const handler =
    new (FieldSearchFieldMetadataOnCreateSideEffectHandlerService as unknown as new () => FieldSearchFieldMetadataOnCreateSideEffectHandlerService)();

  it('should create a searchFieldMetadata row appended at the end when the field is created searchable', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        isSearchable: true,
        objectSearchFieldMetadatas: {
          [EXISTING_SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER]: {
            position: 2,
          },
        },
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    const created = Object.values(
      result.operations.searchFieldMetadata?.flatEntityToCreate ?? {},
    );

    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({
      fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      tsVectorFieldMetadataUniversalIdentifier:
        TS_VECTOR_FIELD_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      position: 3,
      isSystemSideEffect: false,
    });
  });

  it('should append after rows already created earlier in the same batch', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        isSearchable: true,
        pendingSearchFieldMetadataCreatesByFieldUniversalIdentifier: {
          'e1e2e3e4-e5e6-4000-8000-000000000001': { position: 0 },
        },
      }),
    );

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    expect(
      Object.values(
        result.operations.searchFieldMetadata?.flatEntityToCreate ?? {},
      )[0],
    ).toMatchObject({ position: 1 });
  });

  it('should be a noop when the field is created non-searchable', () => {
    const result = handler.buildSideEffects(buildArgs({ isSearchable: false }));

    expect(result.status).toBe('noop');
  });

  it('should be a noop on system builds, which declare their rows explicitly', () => {
    const result = handler.buildSideEffects(
      buildArgs({ isSearchable: true, isSystemBuild: true }),
    );

    expect(result.status).toBe('noop');
  });

  it('should be a noop for the label identifier, whose row the object-create side effect owns', () => {
    const result = handler.buildSideEffects(
      buildArgs({ isSearchable: true, isLabelIdentifier: true }),
    );

    expect(result.status).toBe('noop');
  });

  it('should be a noop when a pending row already targets the field', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        isSearchable: true,
        pendingSearchFieldMetadataCreatesByFieldUniversalIdentifier: {
          [FIELD_UNIVERSAL_IDENTIFIER]: { position: 0 },
        },
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('should be a noop when the object has no search vector field', () => {
    const result = handler.buildSideEffects(
      buildArgs({ isSearchable: true, hasTsVectorField: false }),
    );

    expect(result.status).toBe('noop');
  });
});
