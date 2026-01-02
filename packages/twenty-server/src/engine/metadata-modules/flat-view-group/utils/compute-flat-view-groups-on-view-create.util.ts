import { VIEW_GROUP_VISIBLE_OPTIONS_MAX } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';

type ComputeFlatViewGroupsOnViewCreateArgs = {
  flatViewToCreateId: string;
  mainGroupByFieldMetadataId: string;
} & Pick<AllFlatEntityMaps, 'flatFieldMetadataMaps'>;

export const computeFlatViewGroupsOnViewCreate = ({
  flatViewToCreateId,
  mainGroupByFieldMetadataId,
  flatFieldMetadataMaps,
}: ComputeFlatViewGroupsOnViewCreateArgs): FlatViewGroup[] => {
  const mainGroupByFieldMetadata =
    flatFieldMetadataMaps.byId[mainGroupByFieldMetadataId];

  if (!isDefined(mainGroupByFieldMetadata)) {
    throw new FlatEntityMapsException(
      'mainGroupByFieldMetadataId not found',
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const createdAt = new Date().toISOString();

  const flatViewGroupsFromOptions: FlatViewGroup[] = (
    mainGroupByFieldMetadata.options ?? []
  ).map((option, index) => {
    const viewGroupId = v4();

    return {
      id: viewGroupId,
      fieldMetadataId: mainGroupByFieldMetadata.id,
      viewId: flatViewToCreateId,
      workspaceId: mainGroupByFieldMetadata.workspaceId,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      universalIdentifier: viewGroupId,
      isVisible: index < VIEW_GROUP_VISIBLE_OPTIONS_MAX,
      fieldValue: option.value,
      position: index,
      applicationId: mainGroupByFieldMetadata.applicationId,
    };
  });

  const flatViewGroups: FlatViewGroup[] = [...flatViewGroupsFromOptions];

  if (mainGroupByFieldMetadata.isNullable === true) {
    const emptyGroupId = v4();
    const emptyGroupPosition = flatViewGroupsFromOptions.length;

    flatViewGroups.push({
      id: emptyGroupId,
      viewId: flatViewToCreateId,
      workspaceId: mainGroupByFieldMetadata.workspaceId,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      universalIdentifier: emptyGroupId,
      isVisible: emptyGroupPosition < VIEW_GROUP_VISIBLE_OPTIONS_MAX,
      fieldValue: '',
      position: emptyGroupPosition,
      applicationId: mainGroupByFieldMetadata.applicationId,
    });
  }

  return flatViewGroups;
};
