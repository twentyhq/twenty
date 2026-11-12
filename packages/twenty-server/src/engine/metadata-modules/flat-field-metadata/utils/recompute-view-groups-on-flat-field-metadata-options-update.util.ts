import { VIEW_GROUP_VISIBLE_OPTIONS_MAX } from 'twenty-shared/constants';
import { type EnumFieldMetadataType } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { compareTwoFlatFieldMetadataEnumOptions } from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata-enum-options.util';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { reduceFlatViewGroupsByViewUniversalIdentifier } from 'src/engine/metadata-modules/flat-view-group/utils/reduce-flat-view-groups-by-view-universal-identifier.util';

// A view left without any group gets its first one at position 0.
const NO_VIEW_GROUP_POSITION = -1;

type RecomputeViewGroupsOnFlatFieldMetadataOptionsUpdateArgs = {
  fromFlatFieldMetadata: FlatFieldMetadata<EnumFieldMetadataType>;
  toOptions: FlatFieldMetadata<EnumFieldMetadataType>['options'];
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
  toOptions,
}: RecomputeViewGroupsOnFlatFieldMetadataOptionsUpdateArgs): FlatViewGroupsToDeleteUpdateAndCreate => {
  const {
    deleted: deletedFieldMetadataOptions,
    updated: updatedFieldMetadataOptions,
    created: createdFieldMetadataOptions,
  } = compareTwoFlatFieldMetadataEnumOptions({
    compareLabel: false,
    // An inactive option has no group, so deactivating removes it and reactivating recreates it.
    fromOptions: fromFlatFieldMetadata.options.filter(
      (option) => option.isActive !== false,
    ),
    toOptions: toOptions.filter((option) => option.isActive !== false),
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

  if (flatViewsAffected.length === 0) {
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

  const viewGroupsByViewUniversalIdentifier =
    reduceFlatViewGroupsByViewUniversalIdentifier({
      flatViewGroups: remainingFlatViewGroups,
    });

  const visibleViewGroupCountByViewUniversalIdentifier =
    remainingFlatViewGroups.reduce<Record<string, number>>(
      (acc, flatViewGroup) => {
        if (flatViewGroup.isVisible) {
          acc[flatViewGroup.viewUniversalIdentifier] =
            (acc[flatViewGroup.viewUniversalIdentifier] ?? 0) + 1;
        }

        return acc;
      },
      {},
    );

  // Taken from the views, not their groups: a view whose options were all inactive has no group left.
  const viewUniversalIdentifiers = flatViewsAffected.map(
    (flatView) => flatView.universalIdentifier,
  );

  const createdAt = new Date().toISOString();
  const flatViewGroupsToCreate = createdFieldMetadataOptions.flatMap(
    (option, createdOptionIndex) =>
      viewUniversalIdentifiers.flatMap<FlatViewGroup>(
        (viewUniversalIdentifier) => {
          const hasViewGroupForOption = remainingFlatViewGroups.some(
            (flatViewGroup) =>
              flatViewGroup.viewUniversalIdentifier ===
                viewUniversalIdentifier &&
              flatViewGroup.fieldValue === option.value,
          );

          if (hasViewGroupForOption) {
            return [];
          }

          const viewGroupHighestPosition =
            viewGroupsByViewUniversalIdentifier
              .highestViewGroupPositionByViewUniversalIdentifier[
              viewUniversalIdentifier
            ] ?? NO_VIEW_GROUP_POSITION;

          const currentVisibleCount =
            visibleViewGroupCountByViewUniversalIdentifier[
              viewUniversalIdentifier
            ] ?? 0;
          const isVisible =
            currentVisibleCount < VIEW_GROUP_VISIBLE_OPTIONS_MAX;

          if (isVisible) {
            visibleViewGroupCountByViewUniversalIdentifier[
              viewUniversalIdentifier
            ] = currentVisibleCount + 1;
          }

          const viewGroupId = v4();

          const flatView = findFlatEntityByUniversalIdentifierOrThrow({
            flatEntityMaps: flatViewMaps,
            universalIdentifier: viewUniversalIdentifier,
          });

          return {
            id: viewGroupId,
            fieldMetadataId: fromFlatFieldMetadata.id,
            viewId: flatView.id,
            viewUniversalIdentifier,
            workspaceId,
            createdAt: createdAt,
            updatedAt: createdAt,
            deletedAt: null,
            universalIdentifier: viewGroupId,
            isVisible,
            fieldValue: option.value,
            position: viewGroupHighestPosition + createdOptionIndex + 1,
            applicationId: fromFlatFieldMetadata.applicationId,
            applicationUniversalIdentifier:
              fromFlatFieldMetadata.applicationUniversalIdentifier,
          };
        },
      ),
  );

  return {
    flatViewGroupsToCreate,
    flatViewGroupsToDelete,
    flatViewGroupsToUpdate,
  };
};
