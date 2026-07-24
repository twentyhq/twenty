import {
  getFieldUniversalIdentifier,
  getSystemViewUniversalIdentifier,
  getViewFieldUniversalIdentifier,
} from 'twenty-shared/application';
import { FieldMetadataType, ViewKey } from 'twenty-shared/types';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { FieldIndexViewFieldOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-index-view-field-on-create-side-effect-handler.service';
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
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    viewKey: ViewKey.INDEX,
  });

const computeViewFieldUniversalIdentifier = ({
  viewUniversalIdentifier,
  fieldMetadataUniversalIdentifier,
}: {
  viewUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
}) =>
  getViewFieldUniversalIdentifier({
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
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
  isActive?: boolean;
  deletedAt?: string | null;
  isSystemSideEffect?: boolean;
  objectMetadataUniversalIdentifier?: string;
};

type WorkspaceViewField = {
  universalIdentifier: string;
  viewId: string;
  viewUniversalIdentifier?: string;
  fieldMetadataUniversalIdentifier?: string;
  position: number;
  isActive: boolean;
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
}: {
  triggerFieldMetadata: PendingFieldMetadata;
  pendingFieldMetadatas?: PendingFieldMetadata[];
  objectMetadataCreatedInBatch?: boolean;
  pendingViews?: { universalIdentifier: string; isSystemSideEffect: boolean }[];
  pendingViewFields?: {
    universalIdentifier: string;
    viewUniversalIdentifier: string;
    fieldMetadataUniversalIdentifier: string;
  }[];
  objectMetadataInWorkspace?: boolean;
  viewsInWorkspace?: WorkspaceView[];
  viewFieldsInWorkspace?: WorkspaceViewField[];
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
            viewField,
          ]),
        ),
      },
    },
    context: {},
  }) as unknown as BuildSideEffectsArgs<'fieldMetadata'>;

// Synced INDEX view: the 2-24 reconcile command re-owns every INDEX view to the
// derived identifier, so the handler resolves it by that identifier alone.
const SYNCED_INDEX_VIEW: WorkspaceView = {
  id: 'view-db-id-1',
  universalIdentifier: DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
  key: ViewKey.INDEX,
  isSystemSideEffect: true,
};

describe('FieldIndexViewFieldOnCreateSideEffectHandlerService', () => {
  const handler =
    new (FieldIndexViewFieldOnCreateSideEffectHandlerService as unknown as new () => FieldIndexViewFieldOnCreateSideEffectHandlerService)();

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

      expect(viewFields).toHaveLength(1);
      expect(viewFields[0].position).toBe(1);
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

    it('should noop for a non-displayable field (relation) at object creation', () => {
      const relationField = buildPendingFieldMetadata(
        'assignee',
        FieldMetadataType.RELATION,
      );

      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: relationField,
          pendingFieldMetadatas: [NAME_FIELD, relationField],
          objectMetadataCreatedInBatch: true,
        }),
      );

      expect(result.status).toBe('noop');
    });
  });

  describe('field created on an existing object (historical createOneField behavior)', () => {
    it('should append a hidden view field to the INDEX view resolved by its derived identifier', () => {
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
      expect(viewFields[0].isVisible).toBe(false);
      expect(viewFields[0].isSystemSideEffect).toBe(true);
    });

    it('should emit a hidden view field for a relation field', () => {
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
      expect(viewFields[0].isVisible).toBe(false);
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

    it('should noop when the object has no active INDEX view', () => {
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

      expect(result.status).toBe('noop');
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

    expect(
      Object.values(result.operations.viewField?.flatEntityToCreate ?? {})[0]
        .position,
    ).toBe(1);
  });

  // A second writer claiming the same (view, field) pair is not deduped here:
  // it is a genuine conflict left to surface downstream (engine collision, then
  // the flat view field validator on the pair).
  it('should still emit when a pending view field already covers the same (view, field) pair', () => {
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
});
