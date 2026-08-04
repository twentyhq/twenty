import {
  getFieldUniversalIdentifier,
  getSystemViewFieldUniversalIdentifier,
  getSystemViewUniversalIdentifier,
} from 'twenty-shared/application';
import { FieldMetadataType, ViewKey, ViewType } from 'twenty-shared/types';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { FieldSystemViewFieldsOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-system-view-fields-on-create-side-effect-handler.service';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';

const computeFieldUniversalIdentifier = (name: string) =>
  getFieldUniversalIdentifier({
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    name,
  });

const NAME_FIELD_UNIVERSAL_IDENTIFIER = computeFieldUniversalIdentifier('name');
const PRIORITY_FIELD_UNIVERSAL_IDENTIFIER =
  computeFieldUniversalIdentifier('priority');

const DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER =
  getSystemViewUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    viewKey: ViewKey.INDEX,
  });

const DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER =
  getSystemViewUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    viewKey: ViewKey.FIELDS_WIDGET,
  });

const computeViewFieldUniversalIdentifier = ({
  viewUniversalIdentifier,
  fieldMetadataUniversalIdentifier,
}: {
  viewUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
}) =>
  getSystemViewFieldUniversalIdentifier({
    fieldMetadataApplicationUniversalIdentifier:
      APPLICATION_UNIVERSAL_IDENTIFIER,
    viewUniversalIdentifier,
    fieldMetadataUniversalIdentifier,
  });

type PendingFieldMetadata = {
  universalIdentifier: string;
  objectMetadataUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  name: string;
  type: FieldMetadataType;
  isSystemSideEffect: boolean;
};

const buildPendingFieldMetadata = (
  name: string,
  type: FieldMetadataType = FieldMetadataType.TEXT,
  isSystemSideEffect = false,
): PendingFieldMetadata => ({
  universalIdentifier: computeFieldUniversalIdentifier(name),
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  name,
  type,
  isSystemSideEffect,
});

const NAME_FIELD = buildPendingFieldMetadata('name');
const PRIORITY_FIELD = buildPendingFieldMetadata(
  'priority',
  FieldMetadataType.NUMBER,
);

const OBJECT_METADATA = {
  universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  nameSingular: 'ticket',
  labelIdentifierFieldMetadataUniversalIdentifier:
    NAME_FIELD_UNIVERSAL_IDENTIFIER,
};

type WorkspaceView = {
  id: string;
  universalIdentifier: string;
  key: ViewKey | null;
  type?: ViewType;
  isActive?: boolean;
  deletedAt?: string | null;
  isSystemSideEffect?: boolean;
  objectMetadataUniversalIdentifier?: string;
  viewFieldGroupUniversalIdentifiers?: string[];
};

type WorkspaceViewField = {
  universalIdentifier: string;
  viewId: string;
  viewUniversalIdentifier?: string;
  fieldMetadataUniversalIdentifier?: string;
  viewFieldGroupUniversalIdentifier?: string | null;
  position: number;
  isActive: boolean;
  deletedAt?: string | null;
};

type WorkspaceFieldsWidget = {
  universalIdentifier: string;
  isActive?: boolean;
  deletedAt?: string | null;
  universalConfiguration: {
    configurationType: string;
    viewUniversalIdentifier?: string | null;
    newFieldDefaultVisibility?: boolean | null;
  };
};

type WorkspaceViewFieldGroup = {
  universalIdentifier: string;
  position: number;
  isActive?: boolean;
  deletedAt?: string | null;
};

const buildArgs = ({
  triggerFieldMetadata,
  pendingFieldMetadatas = [],
  objectMetadataCreatedInBatch = false,
  pendingViews = [],
  pendingViewFields = [],
  objectMetadataInWorkspace = false,
  viewsInWorkspace = [],
  viewFieldsInWorkspace = [],
  fieldsWidgetsInWorkspace = [],
  viewFieldGroupsInWorkspace = [],
}: {
  triggerFieldMetadata: PendingFieldMetadata;
  pendingFieldMetadatas?: PendingFieldMetadata[];
  objectMetadataCreatedInBatch?: boolean;
  pendingViews?: {
    universalIdentifier: string;
    isSystemSideEffect: boolean;
    type?: ViewType;
    objectMetadataUniversalIdentifier?: string;
  }[];
  pendingViewFields?: {
    universalIdentifier: string;
    viewUniversalIdentifier: string;
    fieldMetadataUniversalIdentifier: string;
  }[];
  objectMetadataInWorkspace?: boolean;
  viewsInWorkspace?: WorkspaceView[];
  viewFieldsInWorkspace?: WorkspaceViewField[];
  fieldsWidgetsInWorkspace?: WorkspaceFieldsWidget[];
  viewFieldGroupsInWorkspace?: WorkspaceViewFieldGroup[];
}): BuildSideEffectsArgs<'fieldMetadata'> =>
  ({
    flatEntity: triggerFieldMetadata,
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
      objectMetadata: {
        flatEntityToCreate: objectMetadataCreatedInBatch
          ? { [OBJECT_UNIVERSAL_IDENTIFIER]: OBJECT_METADATA }
          : {},
        flatEntityToUpdate: {},
        flatEntityToDelete: {},
      },
      view: {
        flatEntityToCreate: Object.fromEntries(
          pendingViews.map((pendingView) => [
            pendingView.universalIdentifier,
            pendingView,
          ]),
        ),
        flatEntityToUpdate: {},
        flatEntityToDelete: {},
      },
      viewField: {
        flatEntityToCreate: Object.fromEntries(
          pendingViewFields.map((pendingViewField) => [
            pendingViewField.universalIdentifier,
            pendingViewField,
          ]),
        ),
        flatEntityToUpdate: {},
        flatEntityToDelete: {},
      },
    } as unknown as AllFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps: {
      flatObjectMetadataMaps: {
        byUniversalIdentifier: objectMetadataInWorkspace
          ? { [OBJECT_UNIVERSAL_IDENTIFIER]: OBJECT_METADATA }
          : {},
      },
      flatViewMaps: {
        byUniversalIdentifier: Object.fromEntries(
          viewsInWorkspace.map((view) => [
            view.universalIdentifier,
            {
              isActive: true,
              deletedAt: null,
              isSystemSideEffect: false,
              objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
              viewFieldGroupUniversalIdentifiers: [],
              ...view,
              // Mirrors fromViewEntityToFlatView: the view aggregates the
              // view fields pointing at it.
              viewFieldUniversalIdentifiers: viewFieldsInWorkspace
                .filter((viewField) => viewField.viewId === view.id)
                .map((viewField) => viewField.universalIdentifier),
            },
          ]),
        ),
      },
      flatViewFieldMaps: {
        byUniversalIdentifier: Object.fromEntries(
          viewFieldsInWorkspace.map((viewField) => [
            viewField.universalIdentifier,
            { viewFieldGroupUniversalIdentifier: null, ...viewField },
          ]),
        ),
      },
      flatViewFieldGroupMaps: {
        byUniversalIdentifier: Object.fromEntries(
          viewFieldGroupsInWorkspace.map((viewFieldGroup) => [
            viewFieldGroup.universalIdentifier,
            { isActive: true, deletedAt: null, ...viewFieldGroup },
          ]),
        ),
      },
      flatPageLayoutWidgetMaps: {
        byUniversalIdentifier: Object.fromEntries(
          fieldsWidgetsInWorkspace.map((fieldsWidget) => [
            fieldsWidget.universalIdentifier,
            { isActive: true, deletedAt: null, ...fieldsWidget },
          ]),
        ),
      },
    },
    context: {},
  }) as unknown as BuildSideEffectsArgs<'fieldMetadata'>;

// Synced INDEX view: the 2-26 reconcile command re-owns every INDEX view to the
// derived identifier, so the handler resolves it by that identifier alone.
const SYNCED_INDEX_VIEW: WorkspaceView = {
  id: 'view-db-id-1',
  universalIdentifier: DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
  key: ViewKey.INDEX,
  isSystemSideEffect: true,
};

const SYNCED_RECORD_PAGE_VIEW: WorkspaceView = {
  id: 'view-db-id-2',
  universalIdentifier: DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
  key: ViewKey.FIELDS_WIDGET,
  type: ViewType.FIELDS_WIDGET,
  isSystemSideEffect: true,
};

const SYNCED_FIELDS_WIDGET: WorkspaceFieldsWidget = {
  universalIdentifier: 'widget-uid-1',
  universalConfiguration: {
    configurationType: 'FIELDS',
    viewUniversalIdentifier: DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
    newFieldDefaultVisibility: true,
  },
};

const filterByView = <T extends { viewUniversalIdentifier: string }>(
  viewFields: T[],
  viewUniversalIdentifier: string,
): T[] =>
  viewFields.filter(
    (viewField) =>
      viewField.viewUniversalIdentifier === viewUniversalIdentifier,
  );

describe('FieldSystemViewFieldsOnCreateSideEffectHandlerService', () => {
  const handler =
    new (FieldSystemViewFieldsOnCreateSideEffectHandlerService as unknown as new () => FieldSystemViewFieldsOnCreateSideEffectHandlerService)();

  describe('object created in the same batch (default view assembly)', () => {
    it('should emit a visible view field at position 0 for the label identifier', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: NAME_FIELD,
          pendingFieldMetadatas: [NAME_FIELD, PRIORITY_FIELD],
          objectMetadataCreatedInBatch: true,
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
      expect(viewFields[0].universalIdentifier).toBe(
        computeViewFieldUniversalIdentifier({
          viewUniversalIdentifier: DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
          fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
        }),
      );
      expect(viewFields[0].viewUniversalIdentifier).toBe(
        DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
      );
      expect(viewFields[0].position).toBe(0);
      expect(viewFields[0].isVisible).toBe(true);
      expect(viewFields[0].isSystemSideEffect).toBe(true);
    });

    it('should position a non-label caller field after the label identifier', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: PRIORITY_FIELD,
          pendingFieldMetadatas: [NAME_FIELD, PRIORITY_FIELD],
          objectMetadataCreatedInBatch: true,
        }),
      );

      expect(result.status).toBe('success');

      if (result.status !== 'success') {
        throw new Error('expected success');
      }

      const viewFields = Object.values(
        result.operations.viewField?.flatEntityToCreate ?? {},
      );

      // One INDEX view field plus the record-page one.
      expect(viewFields).toHaveLength(2);

      const [indexViewField] = filterByView(
        viewFields,
        DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
      );

      expect(indexViewField.position).toBe(1);
    });

    it('should still emit when the pending INDEX view is a system side effect (object handler emission)', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: NAME_FIELD,
          pendingFieldMetadatas: [NAME_FIELD],
          objectMetadataCreatedInBatch: true,
          pendingViews: [
            {
              universalIdentifier: DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
              isSystemSideEffect: true,
            },
          ],
        }),
      );

      expect(result.status).toBe('success');
    });

    // The engine owns the INDEX view, so the handler no longer defers to a
    // caller-provided one: it emits and lets the engine collision on the view
    // surface the conflict.
    it('should still emit when the caller provides the pending INDEX view (no override)', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: NAME_FIELD,
          pendingFieldMetadatas: [NAME_FIELD],
          objectMetadataCreatedInBatch: true,
          pendingViews: [
            {
              universalIdentifier: DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
              isSystemSideEffect: false,
            },
          ],
        }),
      );

      expect(result.status).toBe('success');
    });

    // Parity with the existing-object path: a relation created in the same
    // batch as its object gets a visible INDEX view field too, otherwise the
    // same manifest yields different views depending on whether the object
    // pre-existed (twentyhq/core-team-issues#2749).
    it.each([
      ['relation', FieldMetadataType.RELATION],
      ['morph relation', FieldMetadataType.MORPH_RELATION],
    ])(
      'should emit a visible view field for a %s field created in the same batch as its object',
      (_label, fieldMetadataType) => {
        const relationField = buildPendingFieldMetadata(
          'assignee',
          fieldMetadataType,
        );

        const result = handler.buildSideEffects(
          buildArgs({
            triggerFieldMetadata: relationField,
            pendingFieldMetadatas: [NAME_FIELD, relationField],
            objectMetadataCreatedInBatch: true,
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
        expect(viewFields[0].universalIdentifier).toBe(
          computeViewFieldUniversalIdentifier({
            viewUniversalIdentifier: DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: relationField.universalIdentifier,
          }),
        );
        expect(viewFields[0].viewUniversalIdentifier).toBe(
          DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
        );
        expect(viewFields[0].position).toBe(1);
        expect(viewFields[0].isVisible).toBe(true);
        expect(viewFields[0].isSystemSideEffect).toBe(true);
      },
    );
  });

  describe('field created on an existing object (historical createOneField behavior)', () => {
    it('should append a visible view field to the INDEX view resolved by its derived identifier', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: PRIORITY_FIELD,
          pendingFieldMetadatas: [PRIORITY_FIELD],
          objectMetadataInWorkspace: true,
          viewsInWorkspace: [SYNCED_INDEX_VIEW],
          viewFieldsInWorkspace: [
            {
              universalIdentifier: 'existing-vf-1',
              viewId: SYNCED_INDEX_VIEW.id,
              position: 0,
              isActive: true,
            },
            {
              universalIdentifier: 'existing-vf-2',
              viewId: SYNCED_INDEX_VIEW.id,
              position: 4,
              isActive: true,
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
      expect(viewFields[0].universalIdentifier).toBe(
        computeViewFieldUniversalIdentifier({
          viewUniversalIdentifier: SYNCED_INDEX_VIEW.universalIdentifier,
          fieldMetadataUniversalIdentifier: PRIORITY_FIELD_UNIVERSAL_IDENTIFIER,
        }),
      );
      expect(viewFields[0].viewUniversalIdentifier).toBe(
        SYNCED_INDEX_VIEW.universalIdentifier,
      );
      expect(viewFields[0].position).toBe(5);
      expect(viewFields[0].isVisible).toBe(true);
      expect(viewFields[0].isSystemSideEffect).toBe(true);
    });

    it('should ignore soft-deleted view fields when computing the append position', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: PRIORITY_FIELD,
          pendingFieldMetadatas: [PRIORITY_FIELD],
          objectMetadataInWorkspace: true,
          viewsInWorkspace: [SYNCED_INDEX_VIEW],
          viewFieldsInWorkspace: [
            {
              universalIdentifier: 'existing-vf-1',
              viewId: SYNCED_INDEX_VIEW.id,
              position: 0,
              isActive: true,
            },
            // A removed column: still in the flat maps but soft-deleted, its
            // position must not inflate the append position.
            {
              universalIdentifier: 'soft-deleted-vf',
              viewId: SYNCED_INDEX_VIEW.id,
              position: 9,
              isActive: true,
              deletedAt: '2024-01-01T00:00:00.000Z',
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
      expect(viewFields[0].position).toBe(1);
    });

    it('should place the label identifier view field strictly below every existing one', () => {
      // Relabeling onto a field created in the same sync: existing positions
      // start above zero, the label lands one below the lowest.
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: NAME_FIELD,
          pendingFieldMetadatas: [NAME_FIELD],
          objectMetadataInWorkspace: true,
          viewsInWorkspace: [SYNCED_INDEX_VIEW],
          viewFieldsInWorkspace: [
            {
              universalIdentifier: 'existing-vf-1',
              viewId: SYNCED_INDEX_VIEW.id,
              position: 2,
              isActive: true,
            },
            {
              universalIdentifier: 'existing-vf-2',
              viewId: SYNCED_INDEX_VIEW.id,
              position: 5,
              isActive: true,
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
      expect(viewFields[0].isVisible).toBe(true);
      expect(viewFields[0].position).toBe(1);
    });

    it('should place the label identifier view field at position 0 on an empty INDEX view', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: NAME_FIELD,
          pendingFieldMetadatas: [NAME_FIELD],
          objectMetadataInWorkspace: true,
          viewsInWorkspace: [SYNCED_INDEX_VIEW],
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
      expect(viewFields[0].isVisible).toBe(true);
      expect(viewFields[0].position).toBe(0);
    });

    it('should emit a visible view field for a relation field', () => {
      const relationField = buildPendingFieldMetadata(
        'assignee',
        FieldMetadataType.RELATION,
      );

      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: relationField,
          pendingFieldMetadatas: [relationField],
          objectMetadataInWorkspace: true,
          viewsInWorkspace: [SYNCED_INDEX_VIEW],
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
      expect(viewFields[0].isVisible).toBe(true);
    });

    // The emitted view field is engine-owned whatever the view provenance, so
    // manifest sync deletion inference never drops it.
    it('should emit an isSystemSideEffect view field on a manifest-owned INDEX view', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: PRIORITY_FIELD,
          pendingFieldMetadatas: [PRIORITY_FIELD],
          objectMetadataInWorkspace: true,
          viewsInWorkspace: [
            { ...SYNCED_INDEX_VIEW, isSystemSideEffect: false },
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

      expect(viewFields[0].isSystemSideEffect).toBe(true);
    });

    // View field groups only ever exist on record-page views, never on an INDEX
    // view, so the appended view field is always ungrouped.
    it('should emit an ungrouped view field', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: PRIORITY_FIELD,
          pendingFieldMetadatas: [PRIORITY_FIELD],
          objectMetadataInWorkspace: true,
          viewsInWorkspace: [SYNCED_INDEX_VIEW],
        }),
      );

      expect(result.status).toBe('success');

      if (result.status !== 'success') {
        throw new Error('expected success');
      }

      expect(
        Object.values(result.operations.viewField?.flatEntityToCreate ?? {})[0]
          .viewFieldGroupUniversalIdentifier,
      ).toBeNull();
    });

    it('should noop when an INDEX view exists but not under its derived identifier (unreconciled workspace)', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: PRIORITY_FIELD,
          pendingFieldMetadatas: [PRIORITY_FIELD],
          objectMetadataInWorkspace: true,
          viewsInWorkspace: [
            {
              ...SYNCED_INDEX_VIEW,
              universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000042',
            },
          ],
        }),
      );

      expect(result.status).toBe('noop');
    });

    it('should emit a view field on a deactivated INDEX view', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: PRIORITY_FIELD,
          pendingFieldMetadatas: [PRIORITY_FIELD],
          objectMetadataInWorkspace: true,
          viewsInWorkspace: [
            { ...SYNCED_INDEX_VIEW, isActive: false },
            {
              id: 'other-view-db-id',
              universalIdentifier: 'other-view-uid',
              key: null,
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
      expect(viewFields[0].viewUniversalIdentifier).toBe(
        DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
      );
      expect(viewFields[0].isVisible).toBe(true);
    });
  });

  it('should not count engine-owned fields when positioning caller view fields', () => {
    const searchVectorField = buildPendingFieldMetadata(
      'searchVector',
      FieldMetadataType.TS_VECTOR,
      true,
    );

    const result = handler.buildSideEffects(
      buildArgs({
        triggerFieldMetadata: PRIORITY_FIELD,
        // searchVector sits in the expanded matrix (emitted by a peer handler)
        // but must not shift the caller field positions.
        pendingFieldMetadatas: [NAME_FIELD, searchVectorField, PRIORITY_FIELD],
        objectMetadataCreatedInBatch: true,
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    const [indexViewField] = filterByView(
      Object.values(result.operations.viewField?.flatEntityToCreate ?? {}),
      DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
    );

    expect(indexViewField.position).toBe(1);
  });

  // A second writer claiming the same INDEX (view, field) pair is not deduped:
  // it is a genuine conflict left to surface downstream (engine collision, then
  // the flat view field validator on the pair). Record-page pairs ARE deduped.
  it('should still emit when a pending view field already covers the same INDEX (view, field) pair', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        triggerFieldMetadata: PRIORITY_FIELD,
        pendingFieldMetadatas: [PRIORITY_FIELD],
        objectMetadataInWorkspace: true,
        viewsInWorkspace: [SYNCED_INDEX_VIEW],
        pendingViewFields: [
          {
            // e.g. emitted caller-side for a FIELDS widget targeting the view
            universalIdentifier: 'random-caller-vf-uid',
            viewUniversalIdentifier: SYNCED_INDEX_VIEW.universalIdentifier,
            fieldMetadataUniversalIdentifier:
              PRIORITY_FIELD_UNIVERSAL_IDENTIFIER,
          },
        ],
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    expect(
      Object.values(result.operations.viewField?.flatEntityToCreate ?? {})[0]
        .fieldMetadataUniversalIdentifier,
    ).toBe(PRIORITY_FIELD_UNIVERSAL_IDENTIFIER);
  });

  it('should fail when the parent object cannot be resolved', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        triggerFieldMetadata: NAME_FIELD,
        pendingFieldMetadatas: [NAME_FIELD],
      }),
    );

    expect(result.status).toBe('fail');
  });

  describe('record-page view field emission', () => {
    it('should emit a record-page view field with the derived identifier on same-batch creation', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: PRIORITY_FIELD,
          pendingFieldMetadatas: [NAME_FIELD, PRIORITY_FIELD],
          objectMetadataCreatedInBatch: true,
        }),
      );

      expect(result.status).toBe('success');

      if (result.status !== 'success') {
        throw new Error('expected success');
      }

      const [recordPageViewField] = filterByView(
        Object.values(result.operations.viewField?.flatEntityToCreate ?? {}),
        DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
      );

      expect(recordPageViewField).toMatchObject({
        universalIdentifier: computeViewFieldUniversalIdentifier({
          viewUniversalIdentifier:
            DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
          fieldMetadataUniversalIdentifier: PRIORITY_FIELD_UNIVERSAL_IDENTIFIER,
        }),
        // The label identifier is excluded, so priority is first.
        position: 0,
        isVisible: true,
        isSystemSideEffect: true,
        viewFieldGroupUniversalIdentifier: null,
      });
    });

    it('should not emit a record-page view field for the label identifier', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: NAME_FIELD,
          pendingFieldMetadatas: [NAME_FIELD, PRIORITY_FIELD],
          objectMetadataCreatedInBatch: true,
        }),
      );

      expect(result.status).toBe('success');

      if (result.status !== 'success') {
        throw new Error('expected success');
      }

      expect(
        filterByView(
          Object.values(result.operations.viewField?.flatEntityToCreate ?? {}),
          DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
        ),
      ).toHaveLength(0);
    });

    it('should not emit a record-page view field when the batch carries a caller-authored record-page stack', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: PRIORITY_FIELD,
          pendingFieldMetadatas: [NAME_FIELD, PRIORITY_FIELD],
          objectMetadataCreatedInBatch: true,
          pendingViews: [
            {
              universalIdentifier: 'app-authored-record-page-view-uid',
              isSystemSideEffect: false,
              type: ViewType.FIELDS_WIDGET,
              objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
            },
          ],
        }),
      );

      expect(result.status).toBe('success');

      if (result.status !== 'success') {
        throw new Error('expected success');
      }

      expect(
        filterByView(
          Object.values(result.operations.viewField?.flatEntityToCreate ?? {}),
          DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
        ),
      ).toHaveLength(0);
    });

    it('should follow the FIELDS widget visibility and append after existing view fields on an existing object', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: PRIORITY_FIELD,
          pendingFieldMetadatas: [PRIORITY_FIELD],
          objectMetadataInWorkspace: true,
          viewsInWorkspace: [SYNCED_INDEX_VIEW, SYNCED_RECORD_PAGE_VIEW],
          viewFieldsInWorkspace: [
            {
              universalIdentifier: 'existing-record-page-vf',
              viewId: SYNCED_RECORD_PAGE_VIEW.id,
              position: 3,
              isActive: true,
            },
          ],
          fieldsWidgetsInWorkspace: [
            {
              ...SYNCED_FIELDS_WIDGET,
              universalConfiguration: {
                ...SYNCED_FIELDS_WIDGET.universalConfiguration,
                newFieldDefaultVisibility: false,
              },
            },
          ],
        }),
      );

      expect(result.status).toBe('success');

      if (result.status !== 'success') {
        throw new Error('expected success');
      }

      const [recordPageViewField] = filterByView(
        Object.values(result.operations.viewField?.flatEntityToCreate ?? {}),
        DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
      );

      expect(recordPageViewField).toMatchObject({
        isVisible: false,
        position: 4,
        isSystemSideEffect: true,
        viewFieldGroupUniversalIdentifier: null,
      });
    });

    it('should append into the last active view field group', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: PRIORITY_FIELD,
          pendingFieldMetadatas: [PRIORITY_FIELD],
          objectMetadataInWorkspace: true,
          viewsInWorkspace: [
            SYNCED_INDEX_VIEW,
            {
              ...SYNCED_RECORD_PAGE_VIEW,
              viewFieldGroupUniversalIdentifiers: [
                'group-uid-1',
                'group-uid-2',
              ],
            },
          ],
          viewFieldsInWorkspace: [
            {
              universalIdentifier: 'grouped-vf',
              viewId: SYNCED_RECORD_PAGE_VIEW.id,
              viewFieldGroupUniversalIdentifier: 'group-uid-2',
              position: 7,
              isActive: true,
            },
            {
              universalIdentifier: 'ungrouped-vf',
              viewId: SYNCED_RECORD_PAGE_VIEW.id,
              position: 11,
              isActive: true,
            },
          ],
          viewFieldGroupsInWorkspace: [
            { universalIdentifier: 'group-uid-1', position: 0 },
            { universalIdentifier: 'group-uid-2', position: 1 },
          ],
          fieldsWidgetsInWorkspace: [SYNCED_FIELDS_WIDGET],
        }),
      );

      expect(result.status).toBe('success');

      if (result.status !== 'success') {
        throw new Error('expected success');
      }

      const [recordPageViewField] = filterByView(
        Object.values(result.operations.viewField?.flatEntityToCreate ?? {}),
        DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
      );

      expect(recordPageViewField).toMatchObject({
        viewFieldGroupUniversalIdentifier: 'group-uid-2',
        position: 8,
      });
    });

    it('should not emit when no active FIELDS widget references the engine record-page view', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: PRIORITY_FIELD,
          pendingFieldMetadatas: [PRIORITY_FIELD],
          objectMetadataInWorkspace: true,
          viewsInWorkspace: [SYNCED_INDEX_VIEW, SYNCED_RECORD_PAGE_VIEW],
        }),
      );

      expect(result.status).toBe('success');

      if (result.status !== 'success') {
        throw new Error('expected success');
      }

      expect(
        filterByView(
          Object.values(result.operations.viewField?.flatEntityToCreate ?? {}),
          DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
        ),
      ).toHaveLength(0);
    });

    it('should not emit when the widget does not declare newFieldDefaultVisibility', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: PRIORITY_FIELD,
          pendingFieldMetadatas: [PRIORITY_FIELD],
          objectMetadataInWorkspace: true,
          viewsInWorkspace: [SYNCED_INDEX_VIEW, SYNCED_RECORD_PAGE_VIEW],
          fieldsWidgetsInWorkspace: [
            {
              ...SYNCED_FIELDS_WIDGET,
              universalConfiguration: {
                configurationType: 'FIELDS',
                viewUniversalIdentifier:
                  DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
                newFieldDefaultVisibility: null,
              },
            },
          ],
        }),
      );

      expect(result.status).toBe('success');

      if (result.status !== 'success') {
        throw new Error('expected success');
      }

      expect(
        filterByView(
          Object.values(result.operations.viewField?.flatEntityToCreate ?? {}),
          DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
        ),
      ).toHaveLength(0);
    });

    it('should not emit when the (view, field) pair is already synced whatever its identifier', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: PRIORITY_FIELD,
          pendingFieldMetadatas: [PRIORITY_FIELD],
          objectMetadataInWorkspace: true,
          viewsInWorkspace: [SYNCED_INDEX_VIEW, SYNCED_RECORD_PAGE_VIEW],
          viewFieldsInWorkspace: [
            {
              // Underived incremental-path row for the same pair.
              universalIdentifier: 'legacy-v4-view-field-uid',
              viewId: SYNCED_RECORD_PAGE_VIEW.id,
              fieldMetadataUniversalIdentifier:
                PRIORITY_FIELD_UNIVERSAL_IDENTIFIER,
              position: 0,
              isActive: true,
            },
          ],
          fieldsWidgetsInWorkspace: [SYNCED_FIELDS_WIDGET],
        }),
      );

      expect(result.status).toBe('success');

      if (result.status !== 'success') {
        throw new Error('expected success');
      }

      expect(
        filterByView(
          Object.values(result.operations.viewField?.flatEntityToCreate ?? {}),
          DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
        ),
      ).toHaveLength(0);
    });
  });
});
