import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

export const createStandardNavigationMenuItemFolderFlatMetadata = ({
  universalIdentifier,
  name,
  icon,
  position,
  navigationMenuItemId,
  workspaceId,
  twentyStandardApplicationId,
  now,
}: {
  universalIdentifier: string;
  name: string;
  icon?: string | null;
  position: number;
  navigationMenuItemId: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  now: string;
}): FlatNavigationMenuItem => ({
  id: navigationMenuItemId,
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
  name,
  link: null,
  icon: icon ?? null,
  position,
  createdAt: now,
  updatedAt: now,
});

export const createStandardNavigationMenuItemFolderItemFlatMetadata = ({
  universalIdentifier,
  viewUniversalIdentifier,
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
  viewUniversalIdentifier: string;
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
  const flatView = findFlatEntityByUniversalIdentifier({
    flatEntityMaps: flatViewMaps,
    universalIdentifier: viewUniversalIdentifier,
  });

  if (!flatView) {
    throw new Error(
      `View not found for universal identifier ${viewUniversalIdentifier}`,
    );
  }

  return {
    id: navigationMenuItemId,
    universalIdentifier,
    applicationId: twentyStandardApplicationId,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    workspaceId,
    userWorkspaceId: null,
    targetRecordId: null,
    targetObjectMetadataId: null,
    targetObjectMetadataUniversalIdentifier: null,
    viewId: flatView.id,
    viewUniversalIdentifier: flatView.universalIdentifier,
    folderId,
    folderUniversalIdentifier,
    name: null,
    link: null,
    icon: null,
    position,
    createdAt: now,
    updatedAt: now,
  };
};
