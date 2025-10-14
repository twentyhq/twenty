import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { compareTwoFlatFieldMetadataEnumOptions } from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata-enum-options.util';
import { FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';
import { EnumFieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

type RecomputeViewGroupsOnFlatFieldMetadataOptionsUpdateArgs = {
  fromFlatFieldMetadata: FlatFieldMetadata<EnumFieldMetadataType>;
  update: PropertyUpdate<FlatFieldMetadata<EnumFieldMetadataType>, 'options'>;
} & Pick<AllFlatEntityMaps, 'flatViewGroupMaps'>;

export type FlatViewGroupsToDeleteUpdateAndCreate = {
  flatViewGroupsToDelete: FlatViewGroup[];
  flatViewGroupsToUpdate: FlatViewGroup[];
  flatViewGroupsToCreate: FlatViewGroup[];
};
export const recomputeViewGroupsOnFlatFieldMetadataOptionsUpdate = ({
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

  const flatViewGroups = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityIds: fromFlatFieldMetadata.viewGroupIds,
    flatEntityMaps: flatViewGroupMaps,
  });

  if (flatViewGroups.length === 0) {
    return {
      flatViewGroupsToCreate: [],
      flatViewGroupsToDelete: [],
      flatViewGroupsToUpdate: [],
    };
  }

  const workspaceId = flatViewGroups[0].workspaceId;

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

  const viewGroupHighestPositionByViewId = flatViewGroups.reduce(
    (accumulator, flatViewGroup) => {
      if (
        flatViewGroupsToDelete.some(
          (flatViewGroupToDelete) =>
            flatViewGroupToDelete.id === flatViewGroup.id,
        )
      ) {
        return accumulator;
      }

      const viewGroupHighestPosition = accumulator[flatViewGroup.viewId] as
        | number
        | undefined;
      if (
        !isDefined(viewGroupHighestPosition) ||
        flatViewGroup.position > viewGroupHighestPosition
      ) {
        // Update to the new higher position
        return {
          ...accumulator,
          [flatViewGroup.viewId]: flatViewGroup.position,
        };
      }
      return accumulator;
    },
    {} as Record<string, number>,
  );

  const viewIdAndHighestViewGroupPosition = Object.entries(
    viewGroupHighestPositionByViewId,
  );

  const createdAt = new Date();
  const flatViewGroupsToCreate = createdFieldMetadataOptions.flatMap(
    (option, createdOptionIndex) =>
      viewIdAndHighestViewGroupPosition.map<FlatViewGroup>(
        ([viewId, viewGroupHighestPosition]) => {
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
            isVisible: true,
            fieldValue: option.value,
            position: viewGroupHighestPosition + createdOptionIndex + 1,
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
