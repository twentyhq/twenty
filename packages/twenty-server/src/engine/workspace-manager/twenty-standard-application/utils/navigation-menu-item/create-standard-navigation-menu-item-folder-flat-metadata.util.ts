import { type NativePageKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

export const createStandardNavigationMenuItemFolderFlatMetadata = ({
  universalIdentifier,
  name,
  icon,
  color,
  position,
  navigationMenuItemId,
  workspaceId,
  twentyStandardApplicationId,
  now,
}: {
  universalIdentifier: string;
  name: string;
  icon?: string | null;
  color: string | null;
  position: number;
  navigationMenuItemId: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  now: string;
}): FlatNavigationMenuItem => ({
  id: navigationMenuItemId,
  type: NavigationMenuItemType.FOLDER,
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
  folderId: null,
  folderUniversalIdentifier: null,
  pageLayoutId: null,
  pageLayoutUniversalIdentifier: null,
  agentChatChannelId: null,
  agentChatChannelUniversalIdentifier: null,
  name,
  link: null,
  nativePageKey: null,
  icon: icon ?? null,
  color,
  position,
  createdAt: now,
  updatedAt: now,
});

export const createStandardNavigationMenuItemFolderItemFlatMetadata = ({
  universalIdentifier,
  viewUniversalIdentifier,
  nativePageKey,
  folderId,
  folderUniversalIdentifier,
  position,
  navigationMenuItemId,
  workspaceId,
  twentyStandardApplicationId,
  dependencyFlatEntityMaps: { flatViewMaps },
  now,
}: {
  universalIdentifier: string;
  viewUniversalIdentifier?: string;
  nativePageKey?: NativePageKey;
  folderId: string;
  folderUniversalIdentifier: string;
  position: number;
  navigationMenuItemId: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  dependencyFlatEntityMaps: {
    flatViewMaps: FlatEntityMaps<FlatView>;
  };
  now: string;
}): FlatNavigationMenuItem => {
  const flatView = isDefined(viewUniversalIdentifier)
    ? findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatViewMaps,
        universalIdentifier: viewUniversalIdentifier,
      })
    : undefined;

  if (!isDefined(nativePageKey) && !isDefined(flatView)) {
    throw new Error(
      `View not found for universal identifier ${viewUniversalIdentifier}`,
    );
  }

  return {
    id: navigationMenuItemId,
    type: isDefined(nativePageKey)
      ? NavigationMenuItemType.NATIVE_PAGE
      : NavigationMenuItemType.OBJECT,
    universalIdentifier,
    applicationId: twentyStandardApplicationId,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    workspaceId,
    userWorkspaceId: null,
    targetRecordId: null,
    targetObjectMetadataId: flatView?.objectMetadataId ?? null,
    targetObjectMetadataUniversalIdentifier:
      flatView?.objectMetadataUniversalIdentifier ?? null,
    viewId: null,
    viewUniversalIdentifier: null,
    folderId,
    folderUniversalIdentifier,
    pageLayoutId: null,
    pageLayoutUniversalIdentifier: null,
    agentChatChannelId: null,
    agentChatChannelUniversalIdentifier: null,
    name: null,
    link: null,
    nativePageKey: nativePageKey ?? null,
    icon: null,
    color: isDefined(nativePageKey) ? null : 'gray',
    position,
    createdAt: now,
    updatedAt: now,
  };
};
