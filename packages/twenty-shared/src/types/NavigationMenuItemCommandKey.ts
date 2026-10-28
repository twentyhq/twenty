import { type NAVIGATION_MENU_ITEM_COMMAND_KEYS } from '@/constants/NavigationMenuItemCommandKeys';

export type NavigationMenuItemCommandKey =
  (typeof NAVIGATION_MENU_ITEM_COMMAND_KEYS)[number];
