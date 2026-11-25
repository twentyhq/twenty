import { type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { isViewFieldRelationScopeReferencingField } from 'src/engine/metadata-modules/flat-view-field/utils/is-view-field-relation-scope-referencing-field.util';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type FlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

type HandleFlatFieldMetadataDeactivationSideEffectsArgs = FromTo<
  FlatFieldMetadata,
  'flatFieldMetadata'
> &
  Pick<
    AllFlatEntityMaps,
    | 'flatViewMaps'
    | 'flatViewFilterMaps'
    | 'flatViewFieldMaps'
    | 'flatViewGroupMaps'
    | 'flatViewSortMaps'
  >;

export type FieldMetadataDeactivationSideEffect = {
  flatViewsToDelete: FlatView[];
  flatViewsToUpdate: FlatView[];
  flatViewFieldsToDelete: FlatViewField[];
  flatViewFiltersToDelete: FlatViewFilter[];
  flatViewSortsToDelete: FlatViewSort[];
};

export const handleFieldMetadataDeactivationSideEffects = ({
  flatViewMaps,
  fromFlatFieldMetadata,
  flatViewFieldMaps,
  flatViewFilterMaps,
  flatViewGroupMaps,
  flatViewSortMaps,
}: HandleFlatFieldMetadataDeactivationSideEffectsArgs): FieldMetadataDeactivationSideEffect => {
  const flatViewFiltersToDelete = findManyFlatEntityByIdInFlatEntityMapsOrThrow(
    {
      flatEntityIds: fromFlatFieldMetadata.viewFilterIds,
      flatEntityMaps: flatViewFilterMaps,
    },
  );

  const flatViewFieldsOnField = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityIds: fromFlatFieldMetadata.viewFieldIds,
    flatEntityMaps: flatViewFieldMaps,
  });

  // No inverse relation to scan; scope columns are removed since dropping a condition would widen them
  const flatViewFieldsReferencingField = Object.values(
    flatViewFieldMaps.byUniversalIdentifier,
  ).filter(
    (flatViewField): flatViewField is FlatViewField =>
      isDefined(flatViewField) &&
      (flatViewField.relationTargetFieldMetadataId ===
        fromFlatFieldMetadata.id ||
        isViewFieldRelationScopeReferencingField({
          universalRelationScope: flatViewField.universalRelationScope,
          fieldMetadataUniversalIdentifier:
            fromFlatFieldMetadata.universalIdentifier,
        })),
  );

  const flatViewFieldsToDelete = [
    ...flatViewFieldsOnField,
    ...flatViewFieldsReferencingField,
  ];

  const flatViewSortsToDelete = Object.values(
    flatViewSortMaps.byUniversalIdentifier,
  ).filter(
    (flatViewSort): flatViewSort is FlatViewSort =>
      isDefined(flatViewSort) &&
      flatViewSort.relationTargetFieldMetadataId === fromFlatFieldMetadata.id,
  );

  const flatViewsAffected: FlatView[] =
    findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityIds: fromFlatFieldMetadata.mainGroupByFieldMetadataViewIds,
      flatEntityMaps: flatViewMaps,
    });

  const flatViewGroups = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityIds: flatViewsAffected.flatMap(
      (flatView) => flatView.viewGroupIds,
    ),
    flatEntityMaps: flatViewGroupMaps,
  });

  const uniqueViewUniversalIdentifiers = [
    ...new Set(flatViewGroups.map((vg) => vg.viewUniversalIdentifier)),
  ];

  const flatViewsWithViewGroups =
    findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow({
      flatEntityMaps: flatViewMaps,
      universalIdentifiers: uniqueViewUniversalIdentifiers,
    });

  const viewIdsFromViewGroups = flatViewsWithViewGroups.map((view) => view.id);

  // Note: We assume a view only has view groups related to one field
  const viewIdsToDelete = [
    ...new Set([
      ...viewIdsFromViewGroups,
      ...fromFlatFieldMetadata.calendarViewIds,
      ...fromFlatFieldMetadata.mainGroupByFieldMetadataViewIds,
    ]),
  ];

  const flatViewsToDelete = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityIds: viewIdsToDelete,
    flatEntityMaps: flatViewMaps,
  });

  const kanbanAggregateOperationViewIds = new Set(
    fromFlatFieldMetadata.kanbanAggregateOperationViewIds,
  );
  const calendarEndViewIds = new Set(fromFlatFieldMetadata.calendarEndViewIds);
  const listDateViewIds = new Set(
    Object.values(flatViewMaps.byUniversalIdentifier)
      .filter(
        (flatView): flatView is FlatView =>
          isDefined(flatView) &&
          flatView.listDateFieldMetadataId === fromFlatFieldMetadata.id,
      )
      .map((flatView) => flatView.id),
  );
  const viewIdsToUpdate = [
    ...new Set([
      ...kanbanAggregateOperationViewIds,
      ...calendarEndViewIds,
      ...listDateViewIds,
    ]),
  ].filter((viewId) => !viewIdsToDelete.includes(viewId));
  const flatViewsToUpdate = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityIds: viewIdsToUpdate,
    flatEntityMaps: flatViewMaps,
  }).map((flatView) => {
    const shouldClearKanbanAggregateOperation =
      kanbanAggregateOperationViewIds.has(flatView.id);
    const shouldClearCalendarEndField = calendarEndViewIds.has(flatView.id);
    const shouldClearListDateField = listDateViewIds.has(flatView.id);

    return {
      ...flatView,
      ...(shouldClearKanbanAggregateOperation && {
        kanbanAggregateOperation: null,
        kanbanAggregateOperationFieldMetadataId: null,
        kanbanAggregateOperationFieldMetadataUniversalIdentifier: null,
      }),
      ...(shouldClearCalendarEndField && {
        calendarEndFieldMetadataId: null,
        calendarEndFieldMetadataUniversalIdentifier: null,
      }),
      ...(shouldClearListDateField && {
        listDateFieldMetadataId: null,
        listDateFieldMetadataUniversalIdentifier: null,
      }),
    };
  });

  return {
    flatViewsToUpdate,
    flatViewsToDelete,
    flatViewFieldsToDelete,
    flatViewFiltersToDelete,
    flatViewSortsToDelete,
  };
};
