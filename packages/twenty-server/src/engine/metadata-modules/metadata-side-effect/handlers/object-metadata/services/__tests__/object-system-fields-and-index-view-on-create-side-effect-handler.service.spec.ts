import {
  getFieldUniversalIdentifier,
  getSystemViewUniversalIdentifier,
  getViewFieldUniversalIdentifier,
} from 'twenty-shared/application';
import { FieldMetadataType, ViewKey } from 'twenty-shared/types';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { ObjectSystemFieldsAndIndexViewOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-system-fields-and-index-view-on-create-side-effect-handler.service';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const OTHER_OBJECT_UNIVERSAL_IDENTIFIER =
  'b1b2b3b4-b5b6-4000-8000-000000000002';

const computeFieldUniversalIdentifier = (name: string) =>
  getFieldUniversalIdentifier({
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    name,
  });

const NAME_FIELD_UNIVERSAL_IDENTIFIER = computeFieldUniversalIdentifier('name');
const SEARCH_VECTOR_FIELD_UNIVERSAL_IDENTIFIER =
  computeFieldUniversalIdentifier('searchVector');

const ALL_SYSTEM_FIELD_NAMES = [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'position',
] as const;

// The subset of system fields the INDEX view displays: id/deletedAt/position are
// filtered out by the view-field builder.
const DISPLAYABLE_SYSTEM_FIELD_NAMES = [
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
] as const;

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

const NAME_FIELD: PendingFieldMetadata = {
  universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'name',
  type: FieldMetadataType.TEXT,
};

const buildArgs = ({
  labelIdentifierFieldMetadataUniversalIdentifier = NAME_FIELD_UNIVERSAL_IDENTIFIER,
  pendingFieldMetadatas = [],
  pendingViewUniversalIdentifiers = [],
}: {
  labelIdentifierFieldMetadataUniversalIdentifier?: string | null;
  pendingFieldMetadatas?: PendingFieldMetadata[];
  pendingViewUniversalIdentifiers?: string[];
}): BuildSideEffectsArgs<'objectMetadata'> =>
  ({
    flatEntity: {
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
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

describe('ObjectSystemFieldsAndIndexViewOnCreateSideEffectHandlerService', () => {
  const handler =
    new (ObjectSystemFieldsAndIndexViewOnCreateSideEffectHandlerService as unknown as new () => ObjectSystemFieldsAndIndexViewOnCreateSideEffectHandlerService)();

  it('should synthesize exactly the 7 reserved system fields, never the caller name nor searchVector', () => {
    const result = handler.buildSideEffects(
      buildArgs({ pendingFieldMetadatas: [NAME_FIELD] }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    const createdUniversalIdentifiers = Object.keys(
      result.operations.fieldMetadata?.flatEntityToCreate ?? {},
    );

    expect(createdUniversalIdentifiers).toHaveLength(7);
    expect(createdUniversalIdentifiers).not.toContain(
      NAME_FIELD_UNIVERSAL_IDENTIFIER,
    );
    expect(createdUniversalIdentifiers).not.toContain(
      SEARCH_VECTOR_FIELD_UNIVERSAL_IDENTIFIER,
    );

    for (const name of ALL_SYSTEM_FIELD_NAMES) {
      expect(createdUniversalIdentifiers).toContain(
        computeFieldUniversalIdentifier(name),
      );
    }
  });

  it('should provision the INDEX view and the system-field view fields only, positioned after the displayable caller fields', () => {
    const result = handler.buildSideEffects(
      buildArgs({ pendingFieldMetadatas: [NAME_FIELD] }),
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
    expect(
      (result.operations.view?.flatEntityToCreate ?? {})[
        DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER
      ]?.isSystemSideEffect,
    ).toBe(true);

    const viewFields = Object.values(
      result.operations.viewField?.flatEntityToCreate ?? {},
    );

    // Only the 4 displayable system fields (id, deletedAt and position are
    // filtered out); the caller name view field is owned by the field creation
    // side effect handler.
    const expectedFieldUniversalIdentifiers =
      DISPLAYABLE_SYSTEM_FIELD_NAMES.map(computeFieldUniversalIdentifier);

    expect(
      viewFields
        .map((viewField) => viewField.fieldMetadataUniversalIdentifier)
        .sort(),
    ).toEqual([...expectedFieldUniversalIdentifiers].sort());

    // Positions are offset past the single displayable caller field (name),
    // whose view field the field handler emits at position 0.
    expect(
      viewFields.map((viewField) => viewField.position).sort((a, b) => a - b),
    ).toEqual([1, 2, 3, 4]);

    for (const viewField of viewFields) {
      expect(viewField.isSystemSideEffect).toBe(true);
      expect(viewField.universalIdentifier).toBe(
        getViewFieldUniversalIdentifier({
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          viewUniversalIdentifier: DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
          fieldMetadataUniversalIdentifier:
            viewField.fieldMetadataUniversalIdentifier,
        }),
      );
    }
  });

  it('should start system view field positions at 0 when there is no displayable caller field', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        labelIdentifierFieldMetadataUniversalIdentifier: null,
        pendingFieldMetadatas: [],
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    expect(
      Object.values(result.operations.viewField?.flatEntityToCreate ?? {})
        .map((viewField) => viewField.position)
        .sort((a, b) => a - b),
    ).toEqual([0, 1, 2, 3]);
  });

  it('should still emit the system fields but skip the view when the caller already provides the INDEX view (override)', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        pendingFieldMetadatas: [NAME_FIELD],
        pendingViewUniversalIdentifiers: [
          DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
        ],
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    expect(
      Object.keys(result.operations.fieldMetadata?.flatEntityToCreate ?? {}),
    ).toHaveLength(7);
    expect(result.operations.view).toBeUndefined();
    expect(result.operations.viewField).toBeUndefined();
  });

  it('should ignore caller fields belonging to other objects when computing the position offset', () => {
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

    expect(
      viewFields.map((viewField) => viewField.fieldMetadataUniversalIdentifier),
    ).not.toContain('c1c2c3c4-c5c6-4000-8000-000000000001');

    // Offset is 1 (only the name field belongs to the created object), not 2.
    expect(
      viewFields.map((viewField) => viewField.position).sort((a, b) => a - b),
    ).toEqual([1, 2, 3, 4]);
  });
});
