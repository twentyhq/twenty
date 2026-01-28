import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type EntityManyToOneIdByUniversalIdentifierMaps } from 'src/engine/workspace-cache/types/entity-many-to-one-id-by-universal-identifier-maps.type';
import { type EntityWithRegroupedOneToManyRelations } from 'src/engine/workspace-cache/types/entity-with-regrouped-one-to-many-relations.type';

type FromCommandMenuItemEntityToFlatCommandMenuItemArgs = {
  commandMenuItemEntity: EntityWithRegroupedOneToManyRelations<CommandMenuItemEntity>;
} & EntityManyToOneIdByUniversalIdentifierMaps<'commandMenuItem'>;

export const fromCommandMenuItemEntityToFlatCommandMenuItem = ({
  commandMenuItemEntity,
  applicationIdToUniversalIdentifierMap,
  objectMetadataIdToUniversalIdentifierMap,
}: FromCommandMenuItemEntityToFlatCommandMenuItemArgs): FlatCommandMenuItem => {
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
    __universal: {
      universalIdentifier: commandMenuItemEntity.universalIdentifier,
      applicationUniversalIdentifier,
      availabilityObjectMetadataUniversalIdentifier,
    },
  };
};
