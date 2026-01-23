import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';

export const FLAT_NAVIGATION_MENU_ITEM_EDITABLE_PROPERTIES = [
  'position',
  'folderId',
  'name',
] as const satisfies (keyof FlatNavigationMenuItem)[];
