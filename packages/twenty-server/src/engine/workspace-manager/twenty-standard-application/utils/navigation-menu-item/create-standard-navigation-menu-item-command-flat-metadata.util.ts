import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

export const createStandardNavigationMenuItemCommandFlatMetadata = ({
  universalIdentifier,
  flatCommandMenuItem,
  position,
  navigationMenuItemId,
  workspaceId,
  twentyStandardApplicationId,
  now,
}: {
  universalIdentifier: string;
  flatCommandMenuItem: Pick<FlatCommandMenuItem, 'id' | 'universalIdentifier'>;
  position: number;
  navigationMenuItemId: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  now: string;
}): FlatNavigationMenuItem => ({
  id: navigationMenuItemId,
  type: NavigationMenuItemType.COMMAND,
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
  parentId: null,
  parentUniversalIdentifier: null,
  pageLayoutId: null,
  pageLayoutUniversalIdentifier: null,
  agentChatChannelId: null,
  agentChatChannelUniversalIdentifier: null,
  workflowId: null,
  workflowUniversalIdentifier: null,
  agentId: null,
  agentUniversalIdentifier: null,
  commandMenuItemId: flatCommandMenuItem.id,
  commandMenuItemUniversalIdentifier: flatCommandMenuItem.universalIdentifier,
  name: null,
  link: null,
  nativePageKey: null,
  builtInSectionKey: null,
  icon: null,
  color: null,
  position,
  isActive: true,
  overrides: null,
  createdAt: now,
  updatedAt: now,
});
