import { type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { reduceFlatViewGroupsByViewId } from 'src/engine/metadata-modules/flat-view-group/utils/reduce-flat-view-groups-by-view-id.util';

type RecomputeViewGroupsOnEnumFlatFieldMetadataIsNullableUpdateArgs = FromTo<
  FlatFieldMetadata,
  'flatFieldMetadata'
> &
  Pick<AllFlatEntityMaps, 'flatViewMaps' | 'flatViewGroupMaps'>;

type EnumFieldMetadataIsNullableUpdateSideEffect = {
  flatViewGroupsToDelete: FlatViewGroup[];
  flatViewGroupsToCreate: FlatViewGroup[];
};
const EMPTY_ENUM_FIELD_METADATA_IS_NULLABLE_UPDATE_SIDE_EFFECT_RESULT: EnumFieldMetadataIsNullableUpdateSideEffect =
  {
    flatViewGroupsToCreate: [],
    flatViewGroupsToDelete: [],
  };

export const recomputeViewGroupsOnEnumFlatFieldMetadataIsNullableUpdate = ({
  flatViewMaps,
  flatViewGroupMaps: allFlatViewGroups,
  fromFlatFieldMetadata,
  toFlatFieldMetadata,
}: RecomputeViewGroupsOnEnumFlatFieldMetadataIsNullableUpdateArgs): {
  flatViewGroupsToDelete: FlatViewGroup[];
  flatViewGroupsToCreate: FlatViewGroup[];
} => {
  const sideEffectResult = structuredClone(
    EMPTY_ENUM_FIELD_METADATA_IS_NULLABLE_UPDATE_SIDE_EFFECT_RESULT,
  );
  const flatViewsAffected = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityIds: fromFlatFieldMetadata.mainGroupByFieldMetadataViewIds,
    flatEntityMaps: flatViewMaps,
  });

  const flatViewGroups = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityIds: flatViewsAffected.flatMap(
      (flatView) => flatView.viewGroupIds,
    ),
    flatEntityMaps: allFlatViewGroups,
  });
  const { flatViewGroupRecordByViewId, highestViewGroupPositionByViewId } =
    reduceFlatViewGroupsByViewId({
      flatViewGroups,
    });

  for (const viewId in flatViewGroupRecordByViewId) {
    const flatViewGroups = Object.values(flatViewGroupRecordByViewId[viewId]);

    const emptyValueFlatViewGroup = flatViewGroups.find(
      (flatViewGroup) => flatViewGroup.fieldValue === '',
    );

    if (
      toFlatFieldMetadata.isNullable === true &&
      !isDefined(emptyValueFlatViewGroup)
    ) {
      const highestViewGroupPosition = highestViewGroupPositionByViewId[viewId];
      const viewGroupId = v4();
      const createdAt = new Date().toISOString();

      sideEffectResult.flatViewGroupsToCreate.push({
        id: viewGroupId,
        universalIdentifier: viewGroupId,
        fieldValue: '',
        position: highestViewGroupPosition + 1,
        isVisible: true,
        workspaceId: toFlatFieldMetadata.workspaceId,
        createdAt,
        updatedAt: createdAt,
        deletedAt: null,
        viewId,
        applicationId: toFlatFieldMetadata.applicationId,
      });
    } else if (isDefined(emptyValueFlatViewGroup)) {
      sideEffectResult.flatViewGroupsToDelete.push(emptyValueFlatViewGroup);
    }
  }

  return sideEffectResult;
};
