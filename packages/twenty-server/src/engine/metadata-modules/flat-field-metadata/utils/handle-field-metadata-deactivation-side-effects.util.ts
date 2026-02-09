import { type FromTo } from 'twenty-shared/types';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
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
  >;

export type FieldMetadataDeactivationSideEffect = {
  flatViewsToDelete: FlatView[];
  flatViewsToUpdate: FlatView[];
  flatViewFieldsToDelete: FlatViewField[];
  flatViewFiltersToDelete: FlatViewFilter[];
};

export const handleFieldMetadataDeactivationSideEffects = ({
  flatViewMaps,
  fromFlatFieldMetadata,
  flatViewFieldMaps,
  flatViewFilterMaps,
  flatViewGroupMaps,
}: HandleFlatFieldMetadataDeactivationSideEffectsArgs): FieldMetadataDeactivationSideEffect => {
  const flatViewFiltersToDelete = findManyFlatEntityByIdInFlatEntityMapsOrThrow(
    {
      flatEntityIds: fromFlatFieldMetadata.viewFilterIds,
      flatEntityMaps: flatViewFilterMaps,
    },
  );

  const flatViewFieldsToDelete = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityIds: fromFlatFieldMetadata.viewFieldIds,
    flatEntityMaps: flatViewFieldMaps,
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

  const viewIdsToUpdate =
    fromFlatFieldMetadata.kanbanAggregateOperationViewIds.filter(
      (viewId) => !viewIdsToDelete.includes(viewId),
    );
  const flatViewsToUpdate = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityIds: viewIdsToUpdate,
    flatEntityMaps: flatViewMaps,
  }).map((flatView) => ({
    ...flatView,
    kanbanAggregateOperation: null,
    kanbanAggregateOperationFieldMetadataId: null,
    kanbanAggregateOperationFieldMetadataUniversalIdentifier: null,
  }));

  return {
    flatViewsToUpdate,
    flatViewsToDelete,
    flatViewFieldsToDelete,
    flatViewFiltersToDelete,
  };
};
