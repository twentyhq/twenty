import { type CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

export const fromFlatCommandMenuItemToCommandMenuItemDto = (
  flatCommandMenuItem: FlatCommandMenuItem,
): CommandMenuItemDTO => ({
  id: flatCommandMenuItem.id,
  workflowVersionId: flatCommandMenuItem.workflowVersionId,
  label: flatCommandMenuItem.label,
  icon: flatCommandMenuItem.icon ?? undefined,
  isPinned: flatCommandMenuItem.isPinned,
  availabilityType: flatCommandMenuItem.availabilityType,
  availabilityObjectMetadataId:
    flatCommandMenuItem.availabilityObjectMetadataId ?? undefined,
  workspaceId: flatCommandMenuItem.workspaceId,
  applicationId: flatCommandMenuItem.applicationId ?? undefined,
  createdAt: new Date(flatCommandMenuItem.createdAt),
  updatedAt: new Date(flatCommandMenuItem.updatedAt),
});
