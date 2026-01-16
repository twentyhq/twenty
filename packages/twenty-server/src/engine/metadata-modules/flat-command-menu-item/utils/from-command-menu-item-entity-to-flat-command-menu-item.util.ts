import { type CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

export const fromCommandMenuItemEntityToFlatCommandMenuItem = (
  commandMenuItemEntity: CommandMenuItemEntity,
): FlatCommandMenuItem => {
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
  };
};
