import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';

export const createStandardNavigationMenuItemFlatMetadata = ({
  workspaceId,
  navigationMenuItemName,
  viewUniversalIdentifier,
  position,
  navigationMenuItemId,
  dependencyFlatEntityMaps: { flatViewMaps },
  twentyStandardApplicationId,
  now,
}: {
  workspaceId: string;
  navigationMenuItemName: keyof typeof STANDARD_NAVIGATION_MENU_ITEMS;
  viewUniversalIdentifier: string;
  position: number;
  navigationMenuItemId: string;
  dependencyFlatEntityMaps: {
    flatViewMaps: FlatEntityMaps<FlatView>;
  };
  twentyStandardApplicationId: string;
  now: string;
}): FlatNavigationMenuItem => {
  const navigationMenuItemDefinition =
    STANDARD_NAVIGATION_MENU_ITEMS[navigationMenuItemName];

  if (!isDefined(navigationMenuItemDefinition)) {
    throw new Error(
      `Invalid navigation menu item configuration ${navigationMenuItemName}`,
    );
  }

  const flatView = findFlatEntityByUniversalIdentifier({
    flatEntityMaps: flatViewMaps,
    universalIdentifier: viewUniversalIdentifier,
  });

  if (!isDefined(flatView)) {
    throw new Error(
      `View not found for universal identifier ${viewUniversalIdentifier}`,
    );
  }

  return {
    id: navigationMenuItemId,
    universalIdentifier: navigationMenuItemDefinition.universalIdentifier,
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
    folderId: null,
    folderUniversalIdentifier: null,
    name: null,
    link: null,
    icon: null,
    position,
    createdAt: now,
    updatedAt: now,
  };
};
