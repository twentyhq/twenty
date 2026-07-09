import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { ObjectSearchVectorOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-search-vector-on-create-side-effect-handler.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';

const NAME_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'name',
});

const SEARCH_VECTOR_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'searchVector',
});

type PendingFieldMetadata = {
  universalIdentifier: string;
  type: FieldMetadataType;
};

const buildArgs = ({
  isSearchable,
  labelIdentifierFieldMetadataUniversalIdentifier,
  pendingFieldMetadatas = [],
  relatedFlatEntityMaps = {
    flatFieldMetadataMaps: { byUniversalIdentifier: {} },
    flatSearchFieldMetadataMaps: { byUniversalIdentifier: {} },
    flatIndexMaps: { byUniversalIdentifier: {} },
  },
}: {
  isSearchable: boolean;
  labelIdentifierFieldMetadataUniversalIdentifier: string | null;
  pendingFieldMetadatas?: PendingFieldMetadata[];
  relatedFlatEntityMaps?: object;
}): BuildSideEffectsArgs<'objectMetadata'> =>
  ({
    flatEntity: {
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      nameSingular: 'ticket',
      isSearchable,
      labelIdentifierFieldMetadataUniversalIdentifier,
    },
    allFlatEntityOperationRecordByMetadataName: {
      ...(pendingFieldMetadatas.length > 0 && {
        fieldMetadata: {
          flatEntityToCreate: Object.fromEntries(
            pendingFieldMetadatas.map((pendingFieldMetadata) => [
              pendingFieldMetadata.universalIdentifier,
              pendingFieldMetadata,
            ]),
          ),
          flatEntityToUpdate: {},
          flatEntityToDelete: {},
        },
      }),
    } as unknown as AllFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
    context: {},
  }) as unknown as BuildSideEffectsArgs<'objectMetadata'>;

const PENDING_TEXT_NAME_FIELD: PendingFieldMetadata = {
  universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
  type: FieldMetadataType.TEXT,
};

describe('ObjectSearchVectorOnCreateSideEffectHandlerService', () => {
  const handler =
    new (ObjectSearchVectorOnCreateSideEffectHandlerService as unknown as new () => ObjectSearchVectorOnCreateSideEffectHandlerService)();

  it('should always provision the searchVector field and its GIN index, plus a searchFieldMetadata for a searchable object with a searchable label identifier', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        isSearchable: true,
        labelIdentifierFieldMetadataUniversalIdentifier:
          NAME_FIELD_UNIVERSAL_IDENTIFIER,
        pendingFieldMetadatas: [PENDING_TEXT_NAME_FIELD],
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    const createdFieldUniversalIdentifiers = Object.keys(
      result.operations.fieldMetadata?.flatEntityToCreate ?? {},
    );

    expect(createdFieldUniversalIdentifiers).toEqual([
      SEARCH_VECTOR_FIELD_UNIVERSAL_IDENTIFIER,
    ]);

    expect(
      Object.keys(result.operations.index?.flatEntityToCreate ?? {}),
    ).toHaveLength(1);

    expect(
      Object.keys(
        result.operations.searchFieldMetadata?.flatEntityToCreate ?? {},
      ),
    ).toHaveLength(1);
  });

  it('should still provision the searchVector field and GIN index but no searchFieldMetadata when the object is not searchable', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        isSearchable: false,
        labelIdentifierFieldMetadataUniversalIdentifier:
          NAME_FIELD_UNIVERSAL_IDENTIFIER,
        pendingFieldMetadatas: [PENDING_TEXT_NAME_FIELD],
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    expect(
      Object.keys(result.operations.fieldMetadata?.flatEntityToCreate ?? {}),
    ).toHaveLength(1);
    expect(
      Object.keys(result.operations.index?.flatEntityToCreate ?? {}),
    ).toHaveLength(1);
    expect(result.operations.searchFieldMetadata).toBeUndefined();
  });

  it('should not provision a searchFieldMetadata for junction objects whose label identifier is the id field', () => {
    const idFieldUniversalIdentifier = getFieldUniversalIdentifier({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      name: 'id',
    });

    const result = handler.buildSideEffects(
      buildArgs({
        isSearchable: true,
        labelIdentifierFieldMetadataUniversalIdentifier:
          idFieldUniversalIdentifier,
        pendingFieldMetadatas: [
          {
            universalIdentifier: idFieldUniversalIdentifier,
            type: FieldMetadataType.UUID,
          },
        ],
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    expect(result.operations.searchFieldMetadata).toBeUndefined();
  });

  it('should not provision a searchFieldMetadata when the caller published a non-searchable field at the derived name identifier', () => {
    // The universal identifier derivation is name-based, so a caller-provided
    // `name` field of any type lands on the derived identifier. The handler must
    // resolve the actual type instead of assuming TEXT.
    const result = handler.buildSideEffects(
      buildArgs({
        isSearchable: true,
        labelIdentifierFieldMetadataUniversalIdentifier:
          NAME_FIELD_UNIVERSAL_IDENTIFIER,
        pendingFieldMetadatas: [
          {
            universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
            type: FieldMetadataType.NUMBER,
          },
        ],
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    expect(result.operations.searchFieldMetadata).toBeUndefined();
  });

  it('should not provision a searchFieldMetadata when the label identifier field cannot be resolved', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        isSearchable: true,
        labelIdentifierFieldMetadataUniversalIdentifier:
          NAME_FIELD_UNIVERSAL_IDENTIFIER,
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    expect(result.operations.searchFieldMetadata).toBeUndefined();
  });

  it('should resolve the label identifier field type from the existing maps when it is not part of the pending operations', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        isSearchable: true,
        labelIdentifierFieldMetadataUniversalIdentifier:
          NAME_FIELD_UNIVERSAL_IDENTIFIER,
        relatedFlatEntityMaps: {
          flatFieldMetadataMaps: {
            byUniversalIdentifier: {
              [NAME_FIELD_UNIVERSAL_IDENTIFIER]: {
                universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
                type: FieldMetadataType.TEXT,
              },
            },
          },
          flatSearchFieldMetadataMaps: { byUniversalIdentifier: {} },
          flatIndexMaps: { byUniversalIdentifier: {} },
        },
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    expect(
      Object.keys(
        result.operations.searchFieldMetadata?.flatEntityToCreate ?? {},
      ),
    ).toHaveLength(1);
  });

  it('should be deterministic across invocations', () => {
    const firstResult = handler.buildSideEffects(
      buildArgs({
        isSearchable: true,
        labelIdentifierFieldMetadataUniversalIdentifier:
          NAME_FIELD_UNIVERSAL_IDENTIFIER,
        pendingFieldMetadatas: [PENDING_TEXT_NAME_FIELD],
      }),
    );
    const secondResult = handler.buildSideEffects(
      buildArgs({
        isSearchable: true,
        labelIdentifierFieldMetadataUniversalIdentifier:
          NAME_FIELD_UNIVERSAL_IDENTIFIER,
        pendingFieldMetadatas: [PENDING_TEXT_NAME_FIELD],
      }),
    );

    if (firstResult.status !== 'success' || secondResult.status !== 'success') {
      throw new Error('expected success');
    }

    expect(
      Object.keys(firstResult.operations.index?.flatEntityToCreate ?? {}),
    ).toEqual(
      Object.keys(secondResult.operations.index?.flatEntityToCreate ?? {}),
    );
  });
});
