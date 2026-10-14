import { type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
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

// The relation target side has no aggregator on the field metadata, so the
// view fields and sorts traversing to the deactivated field are found by scan
const findFlatEntitiesTraversingToFieldMetadata = <
  T extends { id: string; relationTargetFieldMetadataId: string | null },
>({
  fieldMetadataId,
  flatEntityMaps,
}: {
  fieldMetadataId: string;
  flatEntityMaps: { byUniversalIdentifier: Partial<Record<string, T>> };
}): T[] =>
  Object.values(flatEntityMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (flatEntity) =>
        flatEntity.relationTargetFieldMetadataId === fieldMetadataId,
    );

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

  const flatViewFieldsToDelete = [
    ...findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityIds: fromFlatFieldMetadata.viewFieldIds,
      flatEntityMaps: flatViewFieldMaps,
    }),
    ...findFlatEntitiesTraversingToFieldMetadata({
      fieldMetadataId: fromFlatFieldMetadata.id,
      flatEntityMaps: flatViewFieldMaps,
    }),
  ];

  const flatViewSortsToDelete = findFlatEntitiesTraversingToFieldMetadata({
    fieldMetadataId: fromFlatFieldMetadata.id,
    flatEntityMaps: flatViewSortMaps,
  });

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
  const viewIdsToUpdate = [
    ...new Set([...kanbanAggregateOperationViewIds, ...calendarEndViewIds]),
  ].filter((viewId) => !viewIdsToDelete.includes(viewId));
  const flatViewsToUpdate = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityIds: viewIdsToUpdate,
    flatEntityMaps: flatViewMaps,
  }).map((flatView) => {
    const shouldClearKanbanAggregateOperation =
      kanbanAggregateOperationViewIds.has(flatView.id);
    const shouldClearCalendarEndField = calendarEndViewIds.has(flatView.id);

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
