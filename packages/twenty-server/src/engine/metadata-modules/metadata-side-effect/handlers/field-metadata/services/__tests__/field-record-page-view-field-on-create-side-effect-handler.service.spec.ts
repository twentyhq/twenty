import { ViewType } from 'twenty-shared/types';

import { FieldRecordPageViewFieldOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-record-page-view-field-on-create-side-effect-handler.service';
import {
  buildArgs,
  buildPendingFieldMetadata,
  computeViewFieldUniversalIdentifier,
  DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
  filterByView,
  NAME_FIELD,
  OBJECT_UNIVERSAL_IDENTIFIER,
  PRIORITY_FIELD,
  PRIORITY_FIELD_UNIVERSAL_IDENTIFIER,
  SYNCED_FIELDS_WIDGET,
  SYNCED_INDEX_VIEW,
  SYNCED_RECORD_PAGE_VIEW,
} from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/__tests__/field-view-field-on-create-side-effect-test-setup';

describe('FieldRecordPageViewFieldOnCreateSideEffectHandlerService', () => {
  const handler =
    new (FieldRecordPageViewFieldOnCreateSideEffectHandlerService as unknown as new () => FieldRecordPageViewFieldOnCreateSideEffectHandlerService)();

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

    // The engine always produces its system side effects: a caller-pending
    // view field for the same pair is a conflict the pair-uniqueness validator
    // surfaces to the caller, not something the engine yields to.
    it('should still emit when a pending view field already covers the same record-page (view, field) pair', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: PRIORITY_FIELD,
          pendingFieldMetadatas: [NAME_FIELD, PRIORITY_FIELD],
          objectMetadataCreatedInBatch: true,
          pendingViewFields: [
            {
              universalIdentifier: 'caller-authored-record-page-vf-uid',
              viewUniversalIdentifier:
                DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
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

      const recordPageViewFields = filterByView(
        Object.values(result.operations.viewField?.flatEntityToCreate ?? {}),
        DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
      );

      expect(recordPageViewFields).toHaveLength(1);
      expect(recordPageViewFields[0].universalIdentifier).toBe(
        computeViewFieldUniversalIdentifier({
          viewUniversalIdentifier:
            DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
          fieldMetadataUniversalIdentifier: PRIORITY_FIELD_UNIVERSAL_IDENTIFIER,
        }),
      );
    });

    it('should not emit a record-page view field for the label identifier', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          triggerFieldMetadata: NAME_FIELD,
          pendingFieldMetadatas: [NAME_FIELD, PRIORITY_FIELD],
          objectMetadataCreatedInBatch: true,
        }),
      );

      expect(result.status).toBe('noop');
    });

    // Caller-defined custom record pages coexist with the system stack: the
    // engine still emits its record-page view field.
    it('should still emit a record-page view field when the batch carries a caller-authored record-page stack', () => {
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
      ).toHaveLength(1);
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

    it('should offset the append position by the field rank among the batch emitting caller fields', () => {
      const speciesField = buildPendingFieldMetadata('species');
      const traitsField = buildPendingFieldMetadata('traits');

      const buildArgsForTrigger = (
        triggerFieldMetadata: typeof PRIORITY_FIELD,
      ) =>
        buildArgs({
          triggerFieldMetadata,
          // name is the label identifier and species is already synced:
          // neither takes an append slot.
          pendingFieldMetadatas: [
            NAME_FIELD,
            speciesField,
            PRIORITY_FIELD,
            traitsField,
          ],
          objectMetadataInWorkspace: true,
          viewsInWorkspace: [SYNCED_INDEX_VIEW, SYNCED_RECORD_PAGE_VIEW],
          viewFieldsInWorkspace: [
            {
              universalIdentifier: 'existing-record-page-vf',
              viewId: SYNCED_RECORD_PAGE_VIEW.id,
              position: 3,
              isActive: true,
            },
            {
              universalIdentifier: 'species-synced-vf',
              viewId: SYNCED_RECORD_PAGE_VIEW.id,
              fieldMetadataUniversalIdentifier:
                speciesField.universalIdentifier,
              position: 0,
              isActive: true,
            },
          ],
          fieldsWidgetsInWorkspace: [SYNCED_FIELDS_WIDGET],
        });

      const positions = [PRIORITY_FIELD, traitsField].map(
        (triggerFieldMetadata) => {
          const result = handler.buildSideEffects(
            buildArgsForTrigger(triggerFieldMetadata),
          );

          expect(result.status).toBe('success');

          if (result.status !== 'success') {
            throw new Error('expected success');
          }

          const [recordPageViewField] = filterByView(
            Object.values(
              result.operations.viewField?.flatEntityToCreate ?? {},
            ),
            DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
          );

          return recordPageViewField.position;
        },
      );

      expect(positions).toEqual([4, 5]);
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

      expect(result.status).toBe('noop');
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

      expect(result.status).toBe('noop');
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

      expect(result.status).toBe('noop');
    });
  });
});
