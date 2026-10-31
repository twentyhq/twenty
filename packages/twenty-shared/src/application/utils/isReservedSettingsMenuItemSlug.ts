// The slug becomes the tab id in the URL hash, so it must not shadow the tabs
// the application settings pages always render.
export const RESERVED_SETTINGS_MENU_ITEM_SLUGS = [
  'general',
  'variables',
] as const;

export const isReservedSettingsMenuItemSlug = (slug: string): boolean =>
  RESERVED_SETTINGS_MENU_ITEM_SLUGS.some(
    (reservedSlug) => reservedSlug === slug,
  );
