import {
  FieldMetadataType,
  ViewFilterOperand,
  ViewSortDirection,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { handleFieldMetadataDeactivationSideEffects } from 'src/engine/metadata-modules/flat-field-metadata/utils/handle-field-metadata-deactivation-side-effects.util';

const getFlatView = (id: string): FlatView =>
  ({
    id,
    universalIdentifier: `${id}-universal-identifier`,
    applicationId: 'application-id',
    calendarEndFieldMetadataId: 'calendar-end-field-id',
    calendarEndFieldMetadataUniversalIdentifier:
      'calendar-end-field-universal-identifier',
  }) as FlatView;

describe('handleFieldMetadataDeactivationSideEffects', () => {
  const getEmptyRelatedMaps = () => ({
    flatViewFieldMaps: createEmptyFlatEntityMaps(),
    flatViewFilterMaps: createEmptyFlatEntityMaps(),
    flatViewGroupMaps: createEmptyFlatEntityMaps(),
    flatViewSortMaps: createEmptyFlatEntityMaps(),
  });

  it('clears an optional calendar end field without deleting the view', () => {
    const view = getFlatView('calendar-view-id');
    const fromFlatFieldMetadata = getFlatFieldMetadataMock({
      id: 'calendar-end-field-id',
      objectMetadataId: 'object-id',
      universalIdentifier: 'calendar-end-field-universal-identifier',
      type: FieldMetadataType.DATE_TIME,
      calendarEndViewIds: [view.id],
    });

    const result = handleFieldMetadataDeactivationSideEffects({
      fromFlatFieldMetadata,
      toFlatFieldMetadata: {
        ...fromFlatFieldMetadata,
        isActive: false,
      },
      flatViewMaps: addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: view,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      }),
      ...getEmptyRelatedMaps(),
    });

    expect(result.flatViewsToDelete).toEqual([]);
    expect(result.flatViewsToUpdate).toEqual([
      expect.objectContaining({
        id: view.id,
        calendarEndFieldMetadataId: null,
        calendarEndFieldMetadataUniversalIdentifier: null,
      }),
    ]);
  });

  it('clears the list pinned field without deleting the view', () => {
    const view = {
      ...getFlatView('list-view-id'),
      listPinnedFieldMetadataId: 'list-pinned-field-id',
      listPinnedFieldMetadataUniversalIdentifier:
        'list-pinned-field-universal-identifier',
    };
    const fromFlatFieldMetadata = getFlatFieldMetadataMock({
      id: 'list-pinned-field-id',
      objectMetadataId: 'object-id',
      universalIdentifier: 'list-pinned-field-universal-identifier',
      type: FieldMetadataType.DATE_TIME,
    });

    const result = handleFieldMetadataDeactivationSideEffects({
      fromFlatFieldMetadata,
      toFlatFieldMetadata: {
        ...fromFlatFieldMetadata,
        isActive: false,
      },
      flatViewMaps: addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: view,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      }),
      ...getEmptyRelatedMaps(),
    });

    expect(result.flatViewsToDelete).toEqual([]);
    expect(result.flatViewsToUpdate).toEqual([
      expect.objectContaining({
        id: view.id,
        listPinnedFieldMetadataId: null,
        listPinnedFieldMetadataUniversalIdentifier: null,
        calendarEndFieldMetadataId: 'calendar-end-field-id',
      }),
    ]);
  });

  it('deletes the view when the deactivated field is both its start and end field', () => {
    const view = getFlatView('calendar-view-id');
    const fromFlatFieldMetadata = getFlatFieldMetadataMock({
      id: 'calendar-field-id',
      objectMetadataId: 'object-id',
      universalIdentifier: 'calendar-field-universal-identifier',
      type: FieldMetadataType.DATE,
      calendarViewIds: [view.id],
      calendarEndViewIds: [view.id],
    });

    const result = handleFieldMetadataDeactivationSideEffects({
      fromFlatFieldMetadata,
      toFlatFieldMetadata: {
        ...fromFlatFieldMetadata,
        isActive: false,
      },
      flatViewMaps: addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: view,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      }),
      ...getEmptyRelatedMaps(),
    });

    expect(result.flatViewsToDelete).toEqual([view]);
    expect(result.flatViewsToUpdate).toEqual([]);
  });

  it('deletes lookup view fields that show the deactivated field', () => {
    const lookupViewField: FlatViewField = {
      id: 'lookup-view-field-id',
      universalIdentifier: 'lookup-view-field-universal-identifier',
      workspaceId: 'workspace-id',
      applicationId: 'application-id',
      applicationUniversalIdentifier: 'application-universal-identifier',
      fieldMetadataId: 'relation-field-id',
      fieldMetadataUniversalIdentifier: 'relation-field-universal-identifier',
      viewId: 'view-id',
      viewUniversalIdentifier: 'view-universal-identifier',
      viewFieldGroupId: null,
      viewFieldGroupUniversalIdentifier: null,
      isVisible: true,
      size: 150,
      position: 1,
      aggregateOperation: null,
      relationTargetFieldMetadataId: 'target-field-id',
      relationTargetFieldMetadataUniversalIdentifier:
        'target-field-universal-identifier',
      relationScope: null,
      universalRelationScope: null,
      label: null,
      isActive: true,
      isSystemSideEffect: false,
      isCanonical: false,
      overrides: null,
      universalOverrides: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      deletedAt: null,
    };
    const fromFlatFieldMetadata = getFlatFieldMetadataMock({
      id: 'target-field-id',
      objectMetadataId: 'object-id',
      universalIdentifier: 'target-field-universal-identifier',
      type: FieldMetadataType.TEXT,
    });

    const result = handleFieldMetadataDeactivationSideEffects({
      fromFlatFieldMetadata,
      toFlatFieldMetadata: {
        ...fromFlatFieldMetadata,
        isActive: false,
      },
      ...getEmptyRelatedMaps(),
      flatViewMaps: createEmptyFlatEntityMaps(),
      flatViewFieldMaps: addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: lookupViewField,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      }),
    });

    expect(result.flatViewFieldsToDelete).toEqual([lookupViewField]);
  });

  describe('view fields with a relation scope', () => {
    const buildScopedViewField = (
      universalRelationScope: FlatViewField['universalRelationScope'],
    ): FlatViewField => ({
      id: 'scoped-view-field-id',
      universalIdentifier: 'scoped-view-field-universal-identifier',
      workspaceId: 'workspace-id',
      applicationId: 'application-id',
      applicationUniversalIdentifier: 'application-universal-identifier',
      fieldMetadataId: 'one-to-many-field-id',
      fieldMetadataUniversalIdentifier:
        'one-to-many-field-universal-identifier',
      viewId: 'view-id',
      viewUniversalIdentifier: 'view-universal-identifier',
      viewFieldGroupId: null,
      viewFieldGroupUniversalIdentifier: null,
      isVisible: true,
      size: 150,
      position: 1,
      aggregateOperation: null,
      relationTargetFieldMetadataId: null,
      relationTargetFieldMetadataUniversalIdentifier: null,
      relationScope: null,
      label: null,
      universalRelationScope,
      isActive: true,
      isSystemSideEffect: false,
      isCanonical: false,
      overrides: null,
      universalOverrides: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      deletedAt: null,
    });

    const deactivate = (scopedViewField: FlatViewField) => {
      const fromFlatFieldMetadata = getFlatFieldMetadataMock({
        id: 'status-field-id',
        objectMetadataId: 'task-object-id',
        universalIdentifier: 'status-field-universal-identifier',
        type: FieldMetadataType.SELECT,
      });

      return handleFieldMetadataDeactivationSideEffects({
        fromFlatFieldMetadata,
        toFlatFieldMetadata: { ...fromFlatFieldMetadata, isActive: false },
        ...getEmptyRelatedMaps(),
        flatViewMaps: createEmptyFlatEntityMaps(),
        flatViewFieldMaps: addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: scopedViewField,
          flatEntityMaps: createEmptyFlatEntityMaps(),
        }),
      });
    };

    it('deletes a view field filtering on the deactivated field through a relation', () => {
      const scopedViewField = buildScopedViewField({
        filters: [
          {
            id: 'filter-id',
            fieldMetadataUniversalIdentifier: 'task-field-universal-identifier',
            relationTargetFieldMetadataUniversalIdentifier:
              'status-field-universal-identifier',
            operand: ViewFilterOperand.IS_NOT,
            value: ['DONE'],
          },
        ],
        filterGroups: [],
        sorts: [],
      });

      expect(deactivate(scopedViewField).flatViewFieldsToDelete).toEqual([
        scopedViewField,
      ]);
    });

    it('deletes a view field sorting on the deactivated field', () => {
      const scopedViewField = buildScopedViewField({
        filters: [],
        filterGroups: [],
        sorts: [
          {
            fieldMetadataUniversalIdentifier:
              'status-field-universal-identifier',
            direction: ViewSortDirection.ASC,
          },
        ],
      });

      expect(deactivate(scopedViewField).flatViewFieldsToDelete).toEqual([
        scopedViewField,
      ]);
    });

    it('deletes a view field showing the deactivated field of its related records', () => {
      const scopedViewField: FlatViewField = {
        ...buildScopedViewField({ filters: [], filterGroups: [], sorts: [] }),
        relationTargetFieldMetadataId: 'status-field-id',
        relationTargetFieldMetadataUniversalIdentifier:
          'status-field-universal-identifier',
      };

      expect(deactivate(scopedViewField).flatViewFieldsToDelete).toEqual([
        scopedViewField,
      ]);
    });

    it('keeps a view field whose scope does not use the deactivated field', () => {
      const scopedViewField = buildScopedViewField({
        filters: [],
        filterGroups: [],
        sorts: [
          {
            fieldMetadataUniversalIdentifier:
              'due-at-field-universal-identifier',
            direction: ViewSortDirection.ASC,
          },
        ],
        limit: 1,
      });

      expect(deactivate(scopedViewField).flatViewFieldsToDelete).toEqual([]);
    });
  });

  it('deletes view sorts that order by the deactivated field', () => {
    const relationTargetViewSort: FlatViewSort = {
      id: 'view-sort-id',
      universalIdentifier: 'view-sort-universal-identifier',
      workspaceId: 'workspace-id',
      applicationId: 'application-id',
      applicationUniversalIdentifier: 'application-universal-identifier',
      fieldMetadataId: 'relation-field-id',
      fieldMetadataUniversalIdentifier: 'relation-field-universal-identifier',
      viewId: 'view-id',
      viewUniversalIdentifier: 'view-universal-identifier',
      direction: ViewSortDirection.ASC,
      subFieldName: null,
      relationTargetFieldMetadataId: 'target-field-id',
      relationTargetFieldMetadataUniversalIdentifier:
        'target-field-universal-identifier',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      deletedAt: null,
    };
    const fromFlatFieldMetadata = getFlatFieldMetadataMock({
      id: 'target-field-id',
      objectMetadataId: 'object-id',
      universalIdentifier: 'target-field-universal-identifier',
      type: FieldMetadataType.NUMBER,
    });

    const result = handleFieldMetadataDeactivationSideEffects({
      fromFlatFieldMetadata,
      toFlatFieldMetadata: {
        ...fromFlatFieldMetadata,
        isActive: false,
      },
      ...getEmptyRelatedMaps(),
      flatViewMaps: createEmptyFlatEntityMaps(),
      flatViewSortMaps: addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: relationTargetViewSort,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      }),
    });

    expect(result.flatViewSortsToDelete).toEqual([relationTargetViewSort]);
  });
});
