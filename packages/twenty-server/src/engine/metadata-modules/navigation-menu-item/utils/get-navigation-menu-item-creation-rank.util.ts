import { type NavigationMenuItemType } from 'twenty-shared/types';

import { NAVIGATION_MENU_ITEM_CONTAINER_TYPES } from 'src/engine/metadata-modules/flat-navigation-menu-item/constants/navigation-menu-item-container-types.constant';

export const getNavigationMenuItemCreationRank = (
  type: NavigationMenuItemType,
): number => {
  const rank = NAVIGATION_MENU_ITEM_CONTAINER_TYPES.indexOf(type);

  return rank === -1 ? NAVIGATION_MENU_ITEM_CONTAINER_TYPES.length : rank;
};
