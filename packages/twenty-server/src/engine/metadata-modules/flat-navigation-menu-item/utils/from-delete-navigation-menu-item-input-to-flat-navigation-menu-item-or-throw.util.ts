import { isDefined } from 'twenty-shared/utils';

import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import {
  NavigationMenuItemException,
  NavigationMenuItemExceptionCode,
} from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';

export const fromDeleteNavigationMenuItemInputToFlatNavigationMenuItemOrThrow =
  ({
    flatNavigationMenuItemMaps,
    navigationMenuItemId,
  }: {
    flatNavigationMenuItemMaps: MetadataFlatEntityMaps<'navigationMenuItem'>;
    navigationMenuItemId: string;
  }): FlatNavigationMenuItem => {
    const existingFlatNavigationMenuItem = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: navigationMenuItemId,
      flatEntityMaps: flatNavigationMenuItemMaps,
    });

    if (!isDefined(existingFlatNavigationMenuItem)) {
      throw new NavigationMenuItemException(
        'Navigation menu item not found',
        NavigationMenuItemExceptionCode.NAVIGATION_MENU_ITEM_NOT_FOUND,
      );
    }

    return existingFlatNavigationMenuItem;
  };
