import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { ObjectSearchVectorOnUpdateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-search-vector-on-update-side-effect-handler.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';

const NAME_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'name',
});

const TOTO_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'toto',
});

const SEARCH_VECTOR_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'searchVector',
});

const NAME_SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER =
  'c1c2c3c4-c5c6-4000-8000-000000000001';

type PendingFieldMetadata = {
  universalIdentifier: string;
  type: FieldMetadataType;
};

const SEARCH_VECTOR_FLAT_FIELD = {
  universalIdentifier: SEARCH_VECTOR_FIELD_UNIVERSAL_IDENTIFIER,
  type: FieldMetadataType.TS_VECTOR,
  name: 'searchVector',
};

const NAME_SEARCH_FIELD_METADATA = {
  universalIdentifier: NAME_SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
  position: 0,
};

const buildArgs = ({
  isSearchable = true,
  toLabelIdentifier,
  fromLabelIdentifier,
  pendingFieldMetadatas = [],
  existingFlatFieldMetadataByUniversalIdentifier = {
    [SEARCH_VECTOR_FIELD_UNIVERSAL_IDENTIFIER]: SEARCH_VECTOR_FLAT_FIELD,
  },
  existingSearchFieldMetadataByUniversalIdentifier = {
    [NAME_SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER]:
      NAME_SEARCH_FIELD_METADATA,
  },
  existingObjectSearchFieldMetadataUniversalIdentifiers = [
    NAME_SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER,
  ],
  existingObjectFieldUniversalIdentifiers = [
    NAME_FIELD_UNIVERSAL_IDENTIFIER,
    SEARCH_VECTOR_FIELD_UNIVERSAL_IDENTIFIER,
  ],
}: {
  isSearchable?: boolean;
  toLabelIdentifier: string | null;
  fromLabelIdentifier: string | null;
  pendingFieldMetadatas?: PendingFieldMetadata[];
  existingFlatFieldMetadataByUniversalIdentifier?: object;
  existingSearchFieldMetadataByUniversalIdentifier?: object;
  existingObjectSearchFieldMetadataUniversalIdentifiers?: string[];
  existingObjectFieldUniversalIdentifiers?: string[];
}): BuildSideEffectsArgs<'objectMetadata'> =>
  ({
    flatEntity: {
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      nameSingular: 'ticket',
      isSearchable,
      labelIdentifierFieldMetadataUniversalIdentifier: toLabelIdentifier,
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
    relatedFlatEntityMaps: {
      flatObjectMetadataMaps: {
        byUniversalIdentifier: {
          [OBJECT_UNIVERSAL_IDENTIFIER]: {
            universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
            applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
            labelIdentifierFieldMetadataUniversalIdentifier:
              fromLabelIdentifier,
            fieldUniversalIdentifiers: existingObjectFieldUniversalIdentifiers,
            searchFieldMetadataUniversalIdentifiers:
              existingObjectSearchFieldMetadataUniversalIdentifiers,
          },
        },
      },
      flatFieldMetadataMaps: {
        byUniversalIdentifier: existingFlatFieldMetadataByUniversalIdentifier,
      },
      flatSearchFieldMetadataMaps: {
        byUniversalIdentifier: existingSearchFieldMetadataByUniversalIdentifier,
      },
    },
    context: {},
  }) as unknown as BuildSideEffectsArgs<'objectMetadata'>;

const PENDING_TEXT_TOTO_FIELD: PendingFieldMetadata = {
  universalIdentifier: TOTO_FIELD_UNIVERSAL_IDENTIFIER,
  type: FieldMetadataType.TEXT,
};

describe('ObjectSearchVectorOnUpdateSideEffectHandlerService', () => {
  const handler =
    new (ObjectSearchVectorOnUpdateSideEffectHandlerService as unknown as new () => ObjectSearchVectorOnUpdateSideEffectHandlerService)();

  it('should provision a searchFieldMetadata for the new searchable label identifier while preserving the existing surface', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        fromLabelIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
        toLabelIdentifier: TOTO_FIELD_UNIVERSAL_IDENTIFIER,
        pendingFieldMetadatas: [PENDING_TEXT_TOTO_FIELD],
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    const createdSearchFieldMetadatas =
      result.operations.searchFieldMetadata?.flatEntityToCreate ?? {};

    expect(Object.keys(createdSearchFieldMetadatas)).toHaveLength(1);

    const [createdSearchFieldMetadata] = Object.values(
      createdSearchFieldMetadatas,
    );

    expect(createdSearchFieldMetadata.fieldMetadataUniversalIdentifier).toBe(
      TOTO_FIELD_UNIVERSAL_IDENTIFIER,
    );
    expect(
      createdSearchFieldMetadata.tsVectorFieldMetadataUniversalIdentifier,
    ).toBe(SEARCH_VECTOR_FIELD_UNIVERSAL_IDENTIFIER);
    // Appended after the pre-existing name row (position 0).
    expect(createdSearchFieldMetadata.position).toBe(1);
  });

  it('should resolve the new label identifier field type from the existing maps', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        fromLabelIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
        toLabelIdentifier: TOTO_FIELD_UNIVERSAL_IDENTIFIER,
        existingFlatFieldMetadataByUniversalIdentifier: {
          [SEARCH_VECTOR_FIELD_UNIVERSAL_IDENTIFIER]: SEARCH_VECTOR_FLAT_FIELD,
          [TOTO_FIELD_UNIVERSAL_IDENTIFIER]: {
            universalIdentifier: TOTO_FIELD_UNIVERSAL_IDENTIFIER,
            type: FieldMetadataType.TEXT,
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
        result.operations.searchFieldMetadata?.flatEntityToCreate ?? {},
      ),
    ).toHaveLength(1);
  });

  it('should be a noop when the object is not searchable', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        isSearchable: false,
        fromLabelIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
        toLabelIdentifier: TOTO_FIELD_UNIVERSAL_IDENTIFIER,
        pendingFieldMetadatas: [PENDING_TEXT_TOTO_FIELD],
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('should be a noop when the label identifier did not change', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        fromLabelIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
        toLabelIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
        pendingFieldMetadatas: [PENDING_TEXT_TOTO_FIELD],
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('should be a noop when the new label identifier is the system id field (junction object)', () => {
    const idFieldUniversalIdentifier = getFieldUniversalIdentifier({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      name: 'id',
    });

    const result = handler.buildSideEffects(
      buildArgs({
        fromLabelIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
        toLabelIdentifier: idFieldUniversalIdentifier,
        pendingFieldMetadatas: [
          {
            universalIdentifier: idFieldUniversalIdentifier,
            type: FieldMetadataType.UUID,
          },
        ],
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('should be a noop when the new label identifier field is not a searchable type', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        fromLabelIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
        toLabelIdentifier: TOTO_FIELD_UNIVERSAL_IDENTIFIER,
        pendingFieldMetadatas: [
          {
            universalIdentifier: TOTO_FIELD_UNIVERSAL_IDENTIFIER,
            type: FieldMetadataType.NUMBER,
          },
        ],
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('should be a noop when the new label identifier is already indexed', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        fromLabelIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
        toLabelIdentifier: TOTO_FIELD_UNIVERSAL_IDENTIFIER,
        pendingFieldMetadatas: [PENDING_TEXT_TOTO_FIELD],
        existingSearchFieldMetadataByUniversalIdentifier: {
          [NAME_SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER]:
            NAME_SEARCH_FIELD_METADATA,
          'toto-search-row': {
            universalIdentifier: 'toto-search-row',
            fieldMetadataUniversalIdentifier: TOTO_FIELD_UNIVERSAL_IDENTIFIER,
            position: 1,
          },
        },
        existingObjectSearchFieldMetadataUniversalIdentifiers: [
          NAME_SEARCH_FIELD_METADATA_UNIVERSAL_IDENTIFIER,
          'toto-search-row',
        ],
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('should be a noop when the object has no searchVector field to attach to', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        fromLabelIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
        toLabelIdentifier: TOTO_FIELD_UNIVERSAL_IDENTIFIER,
        pendingFieldMetadatas: [PENDING_TEXT_TOTO_FIELD],
        existingFlatFieldMetadataByUniversalIdentifier: {},
        existingObjectFieldUniversalIdentifiers: [
          NAME_FIELD_UNIVERSAL_IDENTIFIER,
        ],
      }),
    );

    expect(result.status).toBe('noop');
  });
});
