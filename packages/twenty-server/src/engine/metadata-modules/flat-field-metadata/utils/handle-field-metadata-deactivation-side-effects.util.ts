import { type FromTo } from 'twenty-shared/types';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

type HandleFlatFieldMetadataDeactivationSideEffectsArgs = FromTo<
  FlatFieldMetadata,
  'flatFieldMetadata'
> &
  Pick<AllFlatEntityMaps, 'flatViewMaps'>;

export type FieldMetadataDeactivationSideEffect = {
  flatViewsToDelete: FlatView[];
  flatViewGroupsToDelete: FlatViewGroup[];
  flatViewFieldToDelete: FlatViewField[];
};

const EMPTY_FIELD_METADATA_DEACTIVATION_SIDE_EFFECT: FieldMetadataDeactivationSideEffect =
  {
    flatViewsToDelete: [],
  };

export const handleFieldMetadataDeactivationSideEffects = ({
  flatViewMaps,
  fromFlatFieldMetadata,
  toFlatFieldMetadata,
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

  const kanbanAggregateOperationFlatViews =
    findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityIds: fromFlatFieldMetadata.kanbanAggregateOperationViewIds,
      flatEntityMaps: flatViewMaps,
    });

  return {
    flatViewsToDelete: kanbanAggregateOperationFlatViews,
  };
};
