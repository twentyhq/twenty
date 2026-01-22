import { type FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';

export const removeFlatNavigationMenuItemFromIndex = ({
  flatNavigationMenuItem,
  flatNavigationMenuItemMaps,
}: {
  flatNavigationMenuItem: FlatNavigationMenuItem;
  flatNavigationMenuItemMaps: FlatNavigationMenuItemMaps;
}): void => {
  const userWorkspaceIdKey = flatNavigationMenuItem.userWorkspaceId ?? 'null';
  const folderIdKey = flatNavigationMenuItem.folderId ?? 'null';

  const itemsArray =
    flatNavigationMenuItemMaps.byUserWorkspaceIdAndFolderId[
      userWorkspaceIdKey
    ]?.[folderIdKey];

  if (!itemsArray) {
    return;
  }

  const index = itemsArray.findIndex(
    (item) => item.id === flatNavigationMenuItem.id,
  );

  if (index === -1) {
    return;
  }

  itemsArray.splice(index, 1);

  if (itemsArray.length > 0) {
    return;
  }

  const userWorkspaceMap =
    flatNavigationMenuItemMaps.byUserWorkspaceIdAndFolderId[userWorkspaceIdKey];

  if (!userWorkspaceMap) {
    return;
  }

  delete userWorkspaceMap[folderIdKey];

  if (Object.keys(userWorkspaceMap).length === 0) {
    delete flatNavigationMenuItemMaps.byUserWorkspaceIdAndFolderId[
      userWorkspaceIdKey
    ];
  }
};
