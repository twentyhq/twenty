import { VIEW_GROUP_VISIBLE_OPTIONS_MAX } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type UniversalFlatViewGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-group.type';

type ComputeFlatViewGroupsOnViewCreateArgs = {
  flatViewToCreateUniversalIdentifier: string;
  mainGroupByFieldMetadataId: string;
} & Pick<AllFlatEntityMaps, 'flatFieldMetadataMaps'>;

export const computeFlatViewGroupsOnViewCreate = ({
  flatViewToCreateUniversalIdentifier,
  mainGroupByFieldMetadataId,
  flatFieldMetadataMaps,
}: ComputeFlatViewGroupsOnViewCreateArgs): UniversalFlatViewGroup[] => {
  const mainGroupByFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: mainGroupByFieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(mainGroupByFieldMetadata)) {
    throw new FlatEntityMapsException(
      'mainGroupByFieldMetadataId not found',
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const createdAt = new Date().toISOString();

  const flatViewGroupsFromOptions: UniversalFlatViewGroup[] = (
    mainGroupByFieldMetadata.options ?? []
  ).map((option, index) => ({
    viewUniversalIdentifier: flatViewToCreateUniversalIdentifier,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: v4(),
    isVisible: index < VIEW_GROUP_VISIBLE_OPTIONS_MAX,
    fieldValue: option.value,
    position: index,
    applicationUniversalIdentifier:
      mainGroupByFieldMetadata.applicationUniversalIdentifier,
  }));

  const flatViewGroups: UniversalFlatViewGroup[] = [
    ...flatViewGroupsFromOptions,
  ];

  if (mainGroupByFieldMetadata.isNullable === true) {
    const emptyGroupId = v4();
    const emptyGroupPosition = flatViewGroupsFromOptions.length;

    flatViewGroups.push({
      viewUniversalIdentifier: flatViewToCreateUniversalIdentifier,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      universalIdentifier: emptyGroupId,
      isVisible: emptyGroupPosition < VIEW_GROUP_VISIBLE_OPTIONS_MAX,
      fieldValue: '',
      position: emptyGroupPosition,
      applicationUniversalIdentifier:
        mainGroupByFieldMetadata.applicationUniversalIdentifier,
    });
  }

  return flatViewGroups;
};
