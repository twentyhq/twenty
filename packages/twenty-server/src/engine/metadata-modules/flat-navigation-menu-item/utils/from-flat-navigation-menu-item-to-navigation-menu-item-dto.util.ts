import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type NavigationMenuItemDTO } from 'src/engine/metadata-modules/navigation-menu-item/dtos/navigation-menu-item.dto';

export const fromFlatNavigationMenuItemToNavigationMenuItemDto = (
  flatNavigationMenuItem: FlatNavigationMenuItem,
): NavigationMenuItemDTO => ({
  id: flatNavigationMenuItem.id,
  userWorkspaceId: flatNavigationMenuItem.userWorkspaceId ?? undefined,
  targetRecordId: flatNavigationMenuItem.targetRecordId,
  targetObjectMetadataId: flatNavigationMenuItem.targetObjectMetadataId,
  folderId: flatNavigationMenuItem.folderId ?? undefined,
  position: flatNavigationMenuItem.position,
  workspaceId: flatNavigationMenuItem.workspaceId,
  applicationId: flatNavigationMenuItem.applicationId ?? undefined,
  createdAt: new Date(flatNavigationMenuItem.createdAt),
  updatedAt: new Date(flatNavigationMenuItem.updatedAt),
});
