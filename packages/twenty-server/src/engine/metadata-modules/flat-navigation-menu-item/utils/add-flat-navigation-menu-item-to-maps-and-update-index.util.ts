import { type FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

export const addFlatNavigationMenuItemToMapsAndUpdateIndex = ({
  flatNavigationMenuItem,
  flatNavigationMenuItemMaps,
}: {
  flatNavigationMenuItem: FlatNavigationMenuItem;
  flatNavigationMenuItemMaps: FlatNavigationMenuItemMaps;
}): void => {
  addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
    flatEntity: flatNavigationMenuItem,
    flatEntityMapsToMutate: flatNavigationMenuItemMaps,
  });

  const userWorkspaceIdKey = flatNavigationMenuItem.userWorkspaceId ?? 'null';
  const folderIdKey = flatNavigationMenuItem.folderId ?? 'null';

  if (
    !flatNavigationMenuItemMaps.byUserWorkspaceIdAndFolderId[userWorkspaceIdKey]
  ) {
    flatNavigationMenuItemMaps.byUserWorkspaceIdAndFolderId[
      userWorkspaceIdKey
    ] = {};
  }

  if (
    !flatNavigationMenuItemMaps.byUserWorkspaceIdAndFolderId[
      userWorkspaceIdKey
    ][folderIdKey]
  ) {
    flatNavigationMenuItemMaps.byUserWorkspaceIdAndFolderId[userWorkspaceIdKey][
      folderIdKey
    ] = [];
  }

  flatNavigationMenuItemMaps.byUserWorkspaceIdAndFolderId[userWorkspaceIdKey][
    folderIdKey
  ].push(flatNavigationMenuItem);
};
