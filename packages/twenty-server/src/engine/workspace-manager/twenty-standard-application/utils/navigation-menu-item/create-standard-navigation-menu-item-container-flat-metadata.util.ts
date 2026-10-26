import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

export const createStandardNavigationMenuItemContainerFlatMetadata = ({
  universalIdentifier,
  type,
  name,
  icon,
  folderId,
  folderUniversalIdentifier,
  position,
  navigationMenuItemId,
  workspaceId,
  twentyStandardApplicationId,
  now,
}: {
  universalIdentifier: string;
  type: NavigationMenuItemType;
  name?: string | null;
  icon?: string | null;
  folderId?: string | null;
  folderUniversalIdentifier?: string | null;
  position: number;
  navigationMenuItemId: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  now: string;
}): FlatNavigationMenuItem => ({
  id: navigationMenuItemId,
  type,
  universalIdentifier,
  applicationId: twentyStandardApplicationId,
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION.universalIdentifier,
  workspaceId,
  userWorkspaceId: null,
  targetRecordId: null,
  targetObjectMetadataId: null,
  targetObjectMetadataUniversalIdentifier: null,
  viewId: null,
  viewUniversalIdentifier: null,
  folderId: folderId ?? null,
  folderUniversalIdentifier: folderUniversalIdentifier ?? null,
  pageLayoutId: null,
  pageLayoutUniversalIdentifier: null,
  name: name ?? null,
  link: null,
  icon: icon ?? null,
  color: null,
  position,
  createdAt: now,
  updatedAt: now,
});
