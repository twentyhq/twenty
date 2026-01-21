import { type FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { removeFlatNavigationMenuItemFromIndex } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/remove-flat-navigation-menu-item-from-index.util';
import { replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/replace-flat-entity-in-flat-entity-maps-through-mutation-or-throw.util';

export const replaceFlatNavigationMenuItemInMapsAndUpdateIndex = ({
  fromFlatNavigationMenuItem,
  toFlatNavigationMenuItem,
  flatNavigationMenuItemMaps,
}: {
  fromFlatNavigationMenuItem: FlatNavigationMenuItem;
  toFlatNavigationMenuItem: FlatNavigationMenuItem;
  flatNavigationMenuItemMaps: FlatNavigationMenuItemMaps;
}): void => {
  const oldUserWorkspaceIdKey =
    fromFlatNavigationMenuItem.userWorkspaceId ?? 'null';
  const oldFolderIdKey = fromFlatNavigationMenuItem.folderId ?? 'null';
  const newUserWorkspaceIdKey =
    toFlatNavigationMenuItem.userWorkspaceId ?? 'null';
  const newFolderIdKey = toFlatNavigationMenuItem.folderId ?? 'null';

  if (
    oldUserWorkspaceIdKey !== newUserWorkspaceIdKey ||
    oldFolderIdKey !== newFolderIdKey
  ) {
    removeFlatNavigationMenuItemFromIndex({
      flatNavigationMenuItem: fromFlatNavigationMenuItem,
      flatNavigationMenuItemMaps,
    });
  }

  replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
    flatEntity: toFlatNavigationMenuItem,
    flatEntityMapsToMutate: flatNavigationMenuItemMaps,
  });

  if (
    oldUserWorkspaceIdKey !== newUserWorkspaceIdKey ||
    oldFolderIdKey !== newFolderIdKey
  ) {
    if (
      !flatNavigationMenuItemMaps.byUserWorkspaceIdAndFolderId[
        newUserWorkspaceIdKey
      ]
    ) {
      flatNavigationMenuItemMaps.byUserWorkspaceIdAndFolderId[
        newUserWorkspaceIdKey
      ] = {};
    }

    if (
      !flatNavigationMenuItemMaps.byUserWorkspaceIdAndFolderId[
        newUserWorkspaceIdKey
      ][newFolderIdKey]
    ) {
      flatNavigationMenuItemMaps.byUserWorkspaceIdAndFolderId[
        newUserWorkspaceIdKey
      ][newFolderIdKey] = [];
    }

    flatNavigationMenuItemMaps.byUserWorkspaceIdAndFolderId[
      newUserWorkspaceIdKey
    ][newFolderIdKey].push(toFlatNavigationMenuItem);
  }
};
