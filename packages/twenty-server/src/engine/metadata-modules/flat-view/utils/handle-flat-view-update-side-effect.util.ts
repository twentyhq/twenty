import { type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { computeFlatViewGroupsOnViewCreate } from 'src/engine/metadata-modules/flat-view-group/utils/compute-flat-view-groups-on-view-create.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

export type FlatViewUpdateSideEffects = {
  flatViewGroupsToDelete: FlatViewGroup[];
  flatViewGroupsToCreate: FlatViewGroup[];
};

type HandleFlatViewUpdateSideEffectArgs = FromTo<FlatView, 'flatView'> &
  Pick<AllFlatEntityMaps, 'flatViewGroupMaps' | 'flatFieldMetadataMaps'>;

export const FLAT_VIEW_UPDATE_EMPTY_SIDE_EFFECTS: FlatViewUpdateSideEffects = {
  flatViewGroupsToDelete: [],
  flatViewGroupsToCreate: [],
};

export const handleFlatViewUpdateSideEffect = ({
  fromFlatView,
  toFlatView,
  flatViewGroupMaps,
  flatFieldMetadataMaps,
}: HandleFlatViewUpdateSideEffectArgs): FlatViewUpdateSideEffects => {
  const sideEffectResult = structuredClone(FLAT_VIEW_UPDATE_EMPTY_SIDE_EFFECTS);

  const newMainGroupByFieldMetadataId = toFlatView.mainGroupByFieldMetadataId;

  const hasMainGroupByFieldMetadataIdChanged =
    fromFlatView.mainGroupByFieldMetadataId !== newMainGroupByFieldMetadataId;

  if (!hasMainGroupByFieldMetadataIdChanged) {
    return sideEffectResult;
  }

  if (fromFlatView.viewGroupIds.length > 0) {
    sideEffectResult.flatViewGroupsToDelete =
      findManyFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityIds: fromFlatView.viewGroupIds,
        flatEntityMaps: flatViewGroupMaps,
      });
  }

  if (!isDefined(newMainGroupByFieldMetadataId)) {
    return sideEffectResult;
  }

  sideEffectResult.flatViewGroupsToCreate = computeFlatViewGroupsOnViewCreate({
    flatViewToCreateId: toFlatView.id,
    mainGroupByFieldMetadataId: newMainGroupByFieldMetadataId,
    flatFieldMetadataMaps,
  });

  return sideEffectResult;
};
