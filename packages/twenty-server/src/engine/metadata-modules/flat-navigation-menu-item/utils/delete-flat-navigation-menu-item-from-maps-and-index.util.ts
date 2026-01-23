import { type FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { removeFlatNavigationMenuItemFromIndex } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/remove-flat-navigation-menu-item-from-index.util';
import { deleteFlatEntityFromFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/delete-flat-entity-from-flat-entity-maps-through-mutation-or-throw.util';

export const deleteFlatNavigationMenuItemFromMapsAndIndex = ({
  flatNavigationMenuItem,
  flatNavigationMenuItemMaps,
}: {
  flatNavigationMenuItem: FlatNavigationMenuItem;
  flatNavigationMenuItemMaps: FlatNavigationMenuItemMaps;
}): void => {
  removeFlatNavigationMenuItemFromIndex({
    flatNavigationMenuItem,
    flatNavigationMenuItemMaps,
  });

  deleteFlatEntityFromFlatEntityMapsThroughMutationOrThrow({
    entityToDeleteId: flatNavigationMenuItem.id,
    flatEntityMapsToMutate: flatNavigationMenuItemMaps,
  });
};
