import { type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

type HandleFlatFieldMetadataDeactivationSideEffectsArgs = FromTo<
  FlatFieldMetadata,
  'flatFieldMetadata'
> &
  Pick<AllFlatEntityMaps, 'flatViewMaps'>;

export type FieldMetadataDeactivationSideEffect = {
  flatViewsToDelete: FlatView[];
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

  const flatViews = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityIds: fromFlatFieldMetadata.viewIds,
    flatEntityMaps: flatViewMaps,
  });

  const flatViewsToDelete = flatViews.filter(
    (flatView) =>
      isDefined(flatView.kanbanAggregateOperationFieldMetadataId) &&
      flatView.kanbanAggregateOperationFieldMetadataId ===
        fromFlatFieldMetadata.id,
  );

  return {
    flatViewsToDelete,
  };
};
