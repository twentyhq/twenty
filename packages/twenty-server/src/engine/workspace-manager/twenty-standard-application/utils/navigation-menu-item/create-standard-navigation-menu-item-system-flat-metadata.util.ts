import {
  NavigationMenuItemType,
  type NavigationSystemPage,
} from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

export const createStandardNavigationMenuItemSystemFlatMetadata = ({
  universalIdentifier,
  systemPage,
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
  systemPage: NavigationSystemPage;
  name: string;
  icon?: string | null;
  folderId: string | null;
  folderUniversalIdentifier: string | null;
  position: number;
  navigationMenuItemId: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  now: string;
}): FlatNavigationMenuItem => ({
  id: navigationMenuItemId,
  type: NavigationMenuItemType.SYSTEM,
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
  folderId,
  folderUniversalIdentifier,
  pageLayoutId: null,
  pageLayoutUniversalIdentifier: null,
  name,
  link: null,
  systemPage,
  icon: icon ?? null,
  color: 'gray',
  position,
  createdAt: now,
  updatedAt: now,
});
