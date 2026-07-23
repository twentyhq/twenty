import {
  getFieldUniversalIdentifier,
  getSystemViewUniversalIdentifier,
  getViewFieldUniversalIdentifier,
} from 'twenty-shared/application';
import { FieldMetadataType, ViewKey } from 'twenty-shared/types';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { ObjectDefaultIndexViewOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-default-index-view-on-create-side-effect-handler.service';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const OTHER_OBJECT_UNIVERSAL_IDENTIFIER =
  'b1b2b3b4-b5b6-4000-8000-000000000002';

const NAME_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'name',
});

const CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'createdAt',
});

const DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER =
  getSystemViewUniversalIdentifier({
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    viewKey: ViewKey.INDEX,
  });

type PendingFieldMetadata = {
  universalIdentifier: string;
  objectMetadataUniversalIdentifier: string;
  name: string;
  type: FieldMetadataType;
};

const buildArgs = ({
  applicationUniversalIdentifier = APPLICATION_UNIVERSAL_IDENTIFIER,
  labelIdentifierFieldMetadataUniversalIdentifier = NAME_FIELD_UNIVERSAL_IDENTIFIER,
  pendingFieldMetadatas = [],
  pendingViewUniversalIdentifiers = [],
}: {
  applicationUniversalIdentifier?: string;
  labelIdentifierFieldMetadataUniversalIdentifier?: string | null;
  pendingFieldMetadatas?: PendingFieldMetadata[];
  pendingViewUniversalIdentifiers?: string[];
}): BuildSideEffectsArgs<'objectMetadata'> =>
  ({
    flatEntity: {
      applicationUniversalIdentifier,
      universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      nameSingular: 'ticket',
      labelIdentifierFieldMetadataUniversalIdentifier,
    },
    allFlatEntityOperationRecordByMetadataName: {
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
      ...(pendingViewUniversalIdentifiers.length > 0 && {
        view: {
          flatEntityToCreate: Object.fromEntries(
            pendingViewUniversalIdentifiers.map((universalIdentifier) => [
              universalIdentifier,
              { universalIdentifier },
            ]),
          ),
          flatEntityToUpdate: {},
          flatEntityToDelete: {},
        },
      }),
    } as unknown as AllFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps: {},
    context: {},
  }) as unknown as BuildSideEffectsArgs<'objectMetadata'>;

const NAME_FIELD: PendingFieldMetadata = {
  universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'name',
  type: FieldMetadataType.TEXT,
};

const CREATED_AT_FIELD: PendingFieldMetadata = {
  universalIdentifier: CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'createdAt',
  type: FieldMetadataType.DATE_TIME,
};

describe('ObjectDefaultIndexViewOnCreateSideEffectHandlerService', () => {
  const handler =
    new (ObjectDefaultIndexViewOnCreateSideEffectHandlerService as unknown as new () => ObjectDefaultIndexViewOnCreateSideEffectHandlerService)();

  it('should provision the INDEX view and its view fields with derived identifiers and isSystemSideEffect', () => {
    const result = handler.buildSideEffects(
      buildArgs({ pendingFieldMetadatas: [NAME_FIELD, CREATED_AT_FIELD] }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    const viewUniversalIdentifiers = Object.keys(
      result.operations.view?.flatEntityToCreate ?? {},
    );

    expect(viewUniversalIdentifiers).toEqual([
      DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
    ]);

    const indexView = (result.operations.view?.flatEntityToCreate ?? {})[
      DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER
    ];

    expect(indexView?.isSystemSideEffect).toBe(true);

    const viewFieldUniversalIdentifiers = Object.keys(
      result.operations.viewField?.flatEntityToCreate ?? {},
    );

    expect(viewFieldUniversalIdentifiers).toEqual(
      [NAME_FIELD, CREATED_AT_FIELD].map((field) =>
        getViewFieldUniversalIdentifier({
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          viewUniversalIdentifier: DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
          fieldMetadataUniversalIdentifier: field.universalIdentifier,
        }),
      ),
    );

    for (const viewField of Object.values(
      result.operations.viewField?.flatEntityToCreate ?? {},
    )) {
      expect(viewField.isSystemSideEffect).toBe(true);
    }
  });

  it('should noop when the caller already provides the INDEX view (override)', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        pendingFieldMetadatas: [NAME_FIELD],
        pendingViewUniversalIdentifiers: [
          DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
        ],
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('should only use fields belonging to the created object', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        pendingFieldMetadatas: [
          NAME_FIELD,
          {
            universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000001',
            objectMetadataUniversalIdentifier:
              OTHER_OBJECT_UNIVERSAL_IDENTIFIER,
            name: 'otherObjectField',
            type: FieldMetadataType.TEXT,
          },
        ],
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    const viewFields = Object.values(
      result.operations.viewField?.flatEntityToCreate ?? {},
    );

    expect(viewFields).toHaveLength(1);
    expect(viewFields[0].fieldMetadataUniversalIdentifier).toBe(
      NAME_FIELD_UNIVERSAL_IDENTIFIER,
    );
  });
});
