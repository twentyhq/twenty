import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromCommandMenuItemEntityToFlatCommandMenuItem = ({
  entity: commandMenuItemEntity,
  applicationIdToUniversalIdentifierMap,
  objectMetadataIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'commandMenuItem'>): FlatCommandMenuItem => {
  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(
      commandMenuItemEntity.applicationId,
    );

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${commandMenuItemEntity.applicationId} not found for commandMenuItem ${commandMenuItemEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  let availabilityObjectMetadataUniversalIdentifier: string | null = null;

  if (isDefined(commandMenuItemEntity.availabilityObjectMetadataId)) {
    availabilityObjectMetadataUniversalIdentifier =
      objectMetadataIdToUniversalIdentifierMap.get(
        commandMenuItemEntity.availabilityObjectMetadataId,
      ) ?? null;

    if (!isDefined(availabilityObjectMetadataUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `ObjectMetadata with id ${commandMenuItemEntity.availabilityObjectMetadataId} not found for commandMenuItem ${commandMenuItemEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }
  }

  return {
    id: commandMenuItemEntity.id,
    workflowVersionId: commandMenuItemEntity.workflowVersionId,
    label: commandMenuItemEntity.label,
    icon: commandMenuItemEntity.icon,
    isPinned: commandMenuItemEntity.isPinned,
    availabilityType: commandMenuItemEntity.availabilityType,
    availabilityObjectMetadataId:
      commandMenuItemEntity.availabilityObjectMetadataId,
    workspaceId: commandMenuItemEntity.workspaceId,
    universalIdentifier: commandMenuItemEntity.universalIdentifier,
    applicationId: commandMenuItemEntity.applicationId,
    createdAt: commandMenuItemEntity.createdAt.toISOString(),
    updatedAt: commandMenuItemEntity.updatedAt.toISOString(),
    applicationUniversalIdentifier,
    availabilityObjectMetadataUniversalIdentifier,
  };
};
