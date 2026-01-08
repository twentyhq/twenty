import { VIEW_GROUP_VISIBLE_OPTIONS_MAX } from 'twenty-shared/constants';
import { type EnumFieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { compareTwoFlatFieldMetadataEnumOptions } from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata-enum-options.util';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { reduceFlatViewGroupsByViewId } from 'src/engine/metadata-modules/flat-view-group/utils/reduce-flat-view-groups-by-view-id.util';
import { type PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';

type RecomputeViewGroupsOnFlatFieldMetadataOptionsUpdateArgs = {
  fromFlatFieldMetadata: FlatFieldMetadata<EnumFieldMetadataType>;
  update: PropertyUpdate<FlatFieldMetadata<EnumFieldMetadataType>, 'options'>;
} & Pick<AllFlatEntityMaps, 'flatViewMaps' | 'flatViewGroupMaps'>;

export type FlatViewGroupsToDeleteUpdateAndCreate = {
  flatViewGroupsToDelete: FlatViewGroup[];
  flatViewGroupsToUpdate: FlatViewGroup[];
  flatViewGroupsToCreate: FlatViewGroup[];
};
export const recomputeViewGroupsOnFlatFieldMetadataOptionsUpdate = ({
  flatViewMaps,
  flatViewGroupMaps,
  fromFlatFieldMetadata,
  update,
}: RecomputeViewGroupsOnFlatFieldMetadataOptionsUpdateArgs): FlatViewGroupsToDeleteUpdateAndCreate => {
  const {
    deleted: deletedFieldMetadataOptions,
    updated: updatedFieldMetadataOptions,
    created: createdFieldMetadataOptions,
  } = compareTwoFlatFieldMetadataEnumOptions({
    compareLabel: false,
    fromOptions: fromFlatFieldMetadata.options,
    toOptions: update.to,
  });

  const flatViewsAffected = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityIds: fromFlatFieldMetadata.mainGroupByFieldMetadataViewIds,
    flatEntityMaps: flatViewMaps,
  });

  const flatViewGroups = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityIds: flatViewsAffected.flatMap(
      (flatView) => flatView.viewGroupIds,
    ),
    flatEntityMaps: flatViewGroupMaps,
  });

  if (flatViewGroups.length === 0) {
    return {
      flatViewGroupsToCreate: [],
      flatViewGroupsToDelete: [],
      flatViewGroupsToUpdate: [],
    };
  }

  const workspaceId = fromFlatFieldMetadata.workspaceId;

  const flatViewGroupsToDelete = deletedFieldMetadataOptions.flatMap((option) =>
    flatViewGroups.filter(
      (flatViewGroup) => flatViewGroup.fieldValue === option.value,
    ),
  );

  const flatViewGroupsToUpdate = updatedFieldMetadataOptions.flatMap(
    ({ from: fromOption, to: toOption }) =>
      flatViewGroups.flatMap((flatViewGroup) =>
        flatViewGroup.fieldValue === fromOption.value
          ? { ...flatViewGroup, fieldValue: toOption.value }
          : [],
      ),
  );

  const remainingFlatViewGroups = flatViewGroups.filter(
    (flatViewGroup) =>
      !flatViewGroupsToDelete.some(
        (flatViewGroupToDelete) =>
          flatViewGroupToDelete.id === flatViewGroup.id,
      ),
  );

  const viewGroupsByViewId = reduceFlatViewGroupsByViewId({
    flatViewGroups: remainingFlatViewGroups,
  });

  // Count visible view groups per view to enforce the limit
  const visibleViewGroupCountByViewId = remainingFlatViewGroups.reduce<
    Record<string, number>
  >((acc, flatViewGroup) => {
    if (flatViewGroup.isVisible) {
      acc[flatViewGroup.viewId] = (acc[flatViewGroup.viewId] ?? 0) + 1;
    }

    return acc;
  }, {});

  const viewIds = Object.keys(viewGroupsByViewId.flatViewGroupRecordByViewId);

  const createdAt = new Date().toISOString();
  const flatViewGroupsToCreate = createdFieldMetadataOptions.flatMap(
    (option, createdOptionIndex) =>
      viewIds.map<FlatViewGroup>((viewId) => {
        const viewGroupHighestPosition =
          viewGroupsByViewId.highestViewGroupPositionByViewId[viewId];

        if (!isDefined(viewGroupHighestPosition)) {
          throw new FlatEntityMapsException(
            'View id highest position not found, should never occur',
            FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
          );
        }

        const currentVisibleCount = visibleViewGroupCountByViewId[viewId] ?? 0;
        const isVisible = currentVisibleCount < VIEW_GROUP_VISIBLE_OPTIONS_MAX;

        // Increment the count for future iterations if this group will be visible
        if (isVisible) {
          visibleViewGroupCountByViewId[viewId] = currentVisibleCount + 1;
        }

        const viewGroupId = v4();

        return {
          id: viewGroupId,
          fieldMetadataId: fromFlatFieldMetadata.id,
          viewId,
          workspaceId,
          createdAt: createdAt,
          updatedAt: createdAt,
          deletedAt: null,
          universalIdentifier: viewGroupId,
          isVisible,
          fieldValue: option.value,
          position: viewGroupHighestPosition + createdOptionIndex + 1,
          applicationId: fromFlatFieldMetadata.applicationId,
        };
      }),
  );

  return {
    flatViewGroupsToCreate,
    flatViewGroupsToDelete,
    flatViewGroupsToUpdate,
  };
};
