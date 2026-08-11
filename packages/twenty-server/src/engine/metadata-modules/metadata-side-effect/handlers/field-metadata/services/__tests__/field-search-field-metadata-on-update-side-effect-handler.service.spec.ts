import { FieldMetadataType } from 'twenty-shared/types';

import { FieldSearchFieldMetadataOnUpdateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-search-field-metadata-on-update-side-effect-handler.service';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const FIELD_UNIVERSAL_IDENTIFIER = 'd1d2d3d4-d5d6-4000-8000-000000000001';
const TS_VECTOR_FIELD_UNIVERSAL_IDENTIFIER =
  'd1d2d3d4-d5d6-4000-8000-000000000002';
const EXISTING_SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER =
  'f1f2f3f4-f5f6-4000-8000-000000000001';
const FIELD_SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER =
  'f1f2f3f4-f5f6-4000-8000-000000000002';

const buildArgs = ({
  isSearchable,
  existingIsSearchable,
  fieldSearchFieldMetadataUniversalIdentifiers = [],
  objectSearchFieldMetadatas = {},
  hasTsVectorField = true,
}: {
  isSearchable: boolean;
  existingIsSearchable: boolean;
  fieldSearchFieldMetadataUniversalIdentifiers?: string[];
  objectSearchFieldMetadatas?: Record<string, { position: number }>;
  hasTsVectorField?: boolean;
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
    allFlatEntityOperationRecordByMetadataName: {},
    relatedFlatEntityMaps: {
      flatFieldMetadataMaps: {
        byUniversalIdentifier: {
          [FIELD_UNIVERSAL_IDENTIFIER]: {
            universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
            objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
            isSearchable: existingIsSearchable,
            searchFieldMetadataUniversalIdentifiers:
              fieldSearchFieldMetadataUniversalIdentifiers,
          },
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
                fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
              },
            ],
          ),
        ),
      },
    },
    context: {},
  }) as unknown as BuildSideEffectsArgs<'fieldMetadata'>;

describe('FieldSearchFieldMetadataOnUpdateSideEffectHandlerService', () => {
  const handler =
    new (FieldSearchFieldMetadataOnUpdateSideEffectHandlerService as unknown as new () => FieldSearchFieldMetadataOnUpdateSideEffectHandlerService)();

  it('should create a searchFieldMetadata row appended at the end when isSearchable is turned on', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        isSearchable: true,
        existingIsSearchable: false,
        objectSearchFieldMetadatas: {
          [EXISTING_SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER]: {
            position: 4,
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
      position: 5,
      isSystemSideEffect: false,
    });
  });

  it('should create the row at position 0 when the object has no search field yet', () => {
    const result = handler.buildSideEffects(
      buildArgs({ isSearchable: true, existingIsSearchable: false }),
    );

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    expect(
      Object.values(
        result.operations.searchFieldMetadata?.flatEntityToCreate ?? {},
      )[0],
    ).toMatchObject({ position: 0 });
  });

  it('should delete every searchFieldMetadata row indexing the field when isSearchable is turned off', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        isSearchable: false,
        existingIsSearchable: true,
        fieldSearchFieldMetadataUniversalIdentifiers: [
          FIELD_SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER,
        ],
        objectSearchFieldMetadatas: {
          [FIELD_SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER]: { position: 2 },
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
    ).toEqual([FIELD_SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER]);
  });

  // Guards #2764: a no-op here is what lets a searchFieldMetadata row keep its
  // position, and later its weight, across an unrelated field update.
  it('should be a noop when isSearchable stays true', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        isSearchable: true,
        existingIsSearchable: true,
        fieldSearchFieldMetadataUniversalIdentifiers: [
          FIELD_SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER,
        ],
        objectSearchFieldMetadatas: {
          [FIELD_SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER]: { position: 2 },
        },
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('should be a noop when isSearchable stays false', () => {
    const result = handler.buildSideEffects(
      buildArgs({ isSearchable: false, existingIsSearchable: false }),
    );

    expect(result.status).toBe('noop');
  });

  it('should be a noop when the object has no search vector field', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        isSearchable: true,
        existingIsSearchable: false,
        hasTsVectorField: false,
      }),
    );

    expect(result.status).toBe('noop');
  });
});
