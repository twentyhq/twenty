import { RESERVED_SETTINGS_MENU_ITEM_SLUGS } from '@/application/constants/ReservedSettingsMenuItemSlugs';

// A UUID-shaped slug could shadow another tab's universalIdentifier hash.
const UUID_SHAPED_SLUG_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export const isReservedSettingsMenuItemSlug = (slug: string): boolean =>
  RESERVED_SETTINGS_MENU_ITEM_SLUGS.some(
    (reservedSlug) => reservedSlug === slug,
  ) || UUID_SHAPED_SLUG_PATTERN.test(slug);
