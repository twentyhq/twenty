import { v4 } from 'uuid';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { addFlatNavigationMenuItemToMapsAndUpdateIndex } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/add-flat-navigation-menu-item-to-maps-and-update-index.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';
import { createStandardNavigationMenuItemFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/navigation-menu-item/create-standard-navigation-menu-item-flat-metadata.util';

export const buildStandardFlatNavigationMenuItemMaps = ({
  now,
  workspaceId,
  twentyStandardApplicationId,
  dependencyFlatEntityMaps: { flatViewMaps },
}: {
  now: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  dependencyFlatEntityMaps: {
    flatViewMaps: FlatEntityMaps<FlatView>;
  };
}): FlatNavigationMenuItemMaps => {
  const flatNavigationMenuItemMaps: FlatNavigationMenuItemMaps = {
    ...createEmptyFlatEntityMaps(),
    byUserWorkspaceIdAndFolderId: {},
  };

  for (const navigationMenuItemName of Object.keys(
    STANDARD_NAVIGATION_MENU_ITEMS,
  ) as Array<keyof typeof STANDARD_NAVIGATION_MENU_ITEMS>) {
    const navigationMenuItemDefinition =
      STANDARD_NAVIGATION_MENU_ITEMS[navigationMenuItemName];

    const flatNavigationMenuItem = createStandardNavigationMenuItemFlatMetadata(
      {
        workspaceId,
        navigationMenuItemName,
        viewUniversalIdentifier:
          navigationMenuItemDefinition.viewUniversalIdentifier,
        position: navigationMenuItemDefinition.position,
        navigationMenuItemId: v4(),
        dependencyFlatEntityMaps: {
          flatViewMaps,
        },
        twentyStandardApplicationId,
        now,
      },
    );

    addFlatNavigationMenuItemToMapsAndUpdateIndex({
      flatNavigationMenuItem,
      flatNavigationMenuItemMaps,
    });
  }

  return flatNavigationMenuItemMaps;
};
