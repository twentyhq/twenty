export const SETTINGS_MENU_ITEM_SLUG_MAX_LENGTH = 64;

const SETTINGS_MENU_ITEM_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const isValidSettingsMenuItemSlug = (slug: string): boolean =>
  slug.length <= SETTINGS_MENU_ITEM_SLUG_MAX_LENGTH &&
  SETTINGS_MENU_ITEM_SLUG_PATTERN.test(slug);
