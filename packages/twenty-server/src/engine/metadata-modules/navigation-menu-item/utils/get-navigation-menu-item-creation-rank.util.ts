import { NavigationMenuItemType } from 'twenty-shared/types';

const PARENT_TYPES_IN_CREATION_ORDER: NavigationMenuItemType[] = [
  NavigationMenuItemType.TAB,
  NavigationMenuItemType.SECTION,
  NavigationMenuItemType.FOLDER,
];

export const getNavigationMenuItemCreationRank = (
  type: NavigationMenuItemType,
): number => {
  const rank = PARENT_TYPES_IN_CREATION_ORDER.indexOf(type);

  return rank === -1 ? PARENT_TYPES_IN_CREATION_ORDER.length : rank;
};
