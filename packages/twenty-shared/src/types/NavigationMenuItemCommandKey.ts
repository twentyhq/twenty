export const NAVIGATION_MENU_ITEM_COMMAND_KEYS = [
  'NEW_CHAT',
  'SEARCH',
  'NEW_AGENT',
  'SETTINGS',
  'ALL_COMMANDS',
] as const;

export type NavigationMenuItemCommandKey =
  (typeof NAVIGATION_MENU_ITEM_COMMAND_KEYS)[number];
