// The slug becomes the tab id in the URL hash, so it must not shadow the tabs
// the application settings pages always render, nor the universalIdentifier
// links that tabs without a slug use.
export const RESERVED_SETTINGS_MENU_ITEM_SLUGS = [
  'general',
  'variables',
] as const;

const UUID_SHAPED_SLUG_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export const isReservedSettingsMenuItemSlug = (slug: string): boolean =>
  RESERVED_SETTINGS_MENU_ITEM_SLUGS.some(
    (reservedSlug) => reservedSlug === slug,
  ) || UUID_SHAPED_SLUG_PATTERN.test(slug);
