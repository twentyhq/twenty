import { FieldMetadataType } from 'twenty-shared/types';

import { FieldIndexViewFieldOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-index-view-field-on-create-side-effect-handler.service';
import {
  buildArgs,
  buildPendingFieldMetadata,
  computeViewFieldUniversalIdentifier,
  DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
  filterByView,
  NAME_FIELD,
  NAME_FIELD_UNIVERSAL_IDENTIFIER,
  PRIORITY_FIELD,
  PRIORITY_FIELD_UNIVERSAL_IDENTIFIER,
  SYNCED_INDEX_VIEW,
} from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/__tests__/field-view-field-on-create-side-effect-test-setup';

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
});
