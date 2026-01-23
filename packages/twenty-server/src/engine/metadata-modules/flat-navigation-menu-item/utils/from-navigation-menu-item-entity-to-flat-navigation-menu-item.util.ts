import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';

export const fromNavigationMenuItemEntityToFlatNavigationMenuItem = (
  navigationMenuItemEntity: NavigationMenuItemEntity,
): FlatNavigationMenuItem => {
  return {
    id: navigationMenuItemEntity.id,
    userWorkspaceId: navigationMenuItemEntity.userWorkspaceId,
    targetRecordId: navigationMenuItemEntity.targetRecordId,
    targetObjectMetadataId: navigationMenuItemEntity.targetObjectMetadataId,
    viewId: navigationMenuItemEntity.viewId,
    folderId: navigationMenuItemEntity.folderId,
    name: navigationMenuItemEntity.name,
    position: navigationMenuItemEntity.position,
    workspaceId: navigationMenuItemEntity.workspaceId,
    universalIdentifier: navigationMenuItemEntity.universalIdentifier,
    applicationId: navigationMenuItemEntity.applicationId,
    createdAt: navigationMenuItemEntity.createdAt.toISOString(),
    updatedAt: navigationMenuItemEntity.updatedAt.toISOString(),
  };
};
