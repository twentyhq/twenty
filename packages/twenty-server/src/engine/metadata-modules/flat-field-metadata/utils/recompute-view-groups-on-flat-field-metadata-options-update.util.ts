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

export type FlatViewGroupsToDeleteAndUpdate = {
  flatViewGroupsToDelete: FlatViewGroup[];
  flatViewGroupsToUpdate: FlatViewGroup[];
  flatViewGroupsToCreate: FlatViewGroup[];
};
export const recomputeViewGroupsOnFlatFieldMetadataOptionsUpdate = ({
  flatViewGroupMaps,
  fromFlatFieldMetadata,
  update,
}: RecomputeViewGroupsOnFlatFieldMetadataOptionsUpdateArgs): FlatViewGroupsToDeleteAndUpdate => {
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
      const viewGroupHighestPosition = accumulator[flatViewGroup.viewId];
      if (
        isDefined(viewGroupHighestPosition) &&
        viewGroupHighestPosition > flatViewGroup.position
      ) {
        return accumulator;
      }

      return {
        ...accumulator,
        [flatViewGroup.viewId]: flatViewGroup.position,
      };
    },
    {} as Partial<Record<string, number>>,
  );

  const tmp = Object.entries(viewGroupHighestPositionByViewId).filter(
    isDefined,
  );
  if (tmp.length > 0) {
    const [firstViewGroup] = flatViewGroups;
    const createdAt = new Date();
    const workpsaceId = firstViewGroup.workspaceId;

    const flatViewGroupsToCreate = tmp.map<FlatViewGroup>(
      ([viewId, viewGroupHighestPosition]) => {
        const viewGroupId = v4();
        return {
          id: viewGroupId,
          fieldMetadataId: fromFlatFieldMetadata.id,
          viewId: firstViewGroup.viewId,
          workspaceId: firstViewGroup.workspaceId,
          createdAt: createdAt,
          updatedAt: createdAt,
          deletedAt: null,
          universalIdentifier: viewGroupId,
          isVisible: true,
          fieldValue: option.value,
          position: viewGroupHighestPosition + 1,
        };
      },
    );
  }

  return {
    flatViewGroupsToCreate,
    flatViewGroupsToDelete,
    flatViewGroupsToUpdate,
  };
};
