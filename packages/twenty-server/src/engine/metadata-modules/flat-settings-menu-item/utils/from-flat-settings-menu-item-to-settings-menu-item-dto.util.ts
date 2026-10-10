import { type FlatSettingsMenuItem } from 'src/engine/metadata-modules/flat-settings-menu-item/types/flat-settings-menu-item.type';
import { type SettingsMenuItemDTO } from 'src/engine/metadata-modules/settings-menu-item/dtos/settings-menu-item.dto';

export const fromFlatSettingsMenuItemToSettingsMenuItemDto = (
  flatSettingsMenuItem: FlatSettingsMenuItem,
): SettingsMenuItemDTO => ({
  id: flatSettingsMenuItem.id,
  frontComponentId: flatSettingsMenuItem.frontComponentId,
  title: flatSettingsMenuItem.title,
  icon: flatSettingsMenuItem.icon,
  position: flatSettingsMenuItem.position,
  scope: flatSettingsMenuItem.scope,
  universalIdentifier: flatSettingsMenuItem.universalIdentifier,
  applicationId: flatSettingsMenuItem.applicationId,
  workspaceId: flatSettingsMenuItem.workspaceId,
  createdAt: new Date(flatSettingsMenuItem.createdAt),
  updatedAt: new Date(flatSettingsMenuItem.updatedAt),
});
