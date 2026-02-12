import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type NavigationMenuItemDTO } from 'src/engine/metadata-modules/navigation-menu-item/dtos/navigation-menu-item.dto';

export const fromFlatNavigationMenuItemToNavigationMenuItemDto = (
  flatNavigationMenuItem: FlatNavigationMenuItem,
): NavigationMenuItemDTO => ({
  id: flatNavigationMenuItem.id,
  userWorkspaceId: flatNavigationMenuItem.userWorkspaceId ?? undefined,
  targetRecordId: flatNavigationMenuItem.targetRecordId ?? undefined,
  targetObjectMetadataId:
    flatNavigationMenuItem.targetObjectMetadataId ?? undefined,
  viewId: flatNavigationMenuItem.viewId ?? undefined,
  folderId: flatNavigationMenuItem.folderId ?? undefined,
  name: flatNavigationMenuItem.name ?? undefined,
  link: flatNavigationMenuItem.link ?? undefined,
  position: flatNavigationMenuItem.position,
  workspaceId: flatNavigationMenuItem.workspaceId,
  applicationId: flatNavigationMenuItem.applicationId ?? undefined,
  createdAt: new Date(flatNavigationMenuItem.createdAt),
  updatedAt: new Date(flatNavigationMenuItem.updatedAt),
});
