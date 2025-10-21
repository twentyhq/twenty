import { type FromTo } from 'twenty-shared/types';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { reduceFlatViewGroupsByViewId } from 'src/engine/metadata-modules/flat-view-group/utils/reduce-flat-view-groups-by-view-id.util';
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
  flatViewFieldsToDelete: FlatViewField[];
  flatViewFiltersToDelete: FlatViewFilter[];
};

const EMPTY_FIELD_METADATA_DEACTIVATION_SIDE_EFFECT: FieldMetadataDeactivationSideEffect =
  {
    flatViewsToDelete: [],
    flatViewFieldsToDelete: [],
    flatViewFiltersToDelete: [],
  };

export const handleFieldMetadataDeactivationSideEffects = ({
  flatViewMaps,
  fromFlatFieldMetadata,
  toFlatFieldMetadata,
  flatViewFieldMaps,
  flatViewFilterMaps,
  flatViewGroupMaps,
}: HandleFlatFieldMetadataDeactivationSideEffectsArgs): FieldMetadataDeactivationSideEffect => {
  const sideEffectResult = structuredClone(
    EMPTY_FIELD_METADATA_DEACTIVATION_SIDE_EFFECT,
  );

  if (
    fromFlatFieldMetadata.isActive !== true &&
    toFlatFieldMetadata.isActive !== false
  ) {
    return sideEffectResult;
  }

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

  const flatViewGroups = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityIds: fromFlatFieldMetadata.viewGroupIds,
    flatEntityMaps: flatViewGroupMaps,
  });

  const { flatViewGroupRecordByViewId } = reduceFlatViewGroupsByViewId({
    flatViewGroups,
  });

  // Note: We assume a view only has view groups related to one field
  const relatedViewIds = [
    ...new Set([
      ...Object.keys(flatViewGroupRecordByViewId),
      ...fromFlatFieldMetadata.kanbanAggregateOperationViewIds,
    ]),
  ];

  const flatViewsToDelete = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityIds: relatedViewIds,
    flatEntityMaps: flatViewMaps,
  });

  return {
    flatViewsToDelete,
    flatViewFieldsToDelete,
    flatViewFiltersToDelete,
  };
};
