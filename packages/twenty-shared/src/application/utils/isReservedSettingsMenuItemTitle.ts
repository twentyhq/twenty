// The application settings menu always renders its own General item first, so an
// application declaring that title would produce two items named the same.
export const RESERVED_SETTINGS_MENU_ITEM_TITLES = ['General'] as const;

export const isReservedSettingsMenuItemTitle = (title: string): boolean =>
  RESERVED_SETTINGS_MENU_ITEM_TITLES.some(
    (reservedTitle) =>
      reservedTitle.toLowerCase() === title.trim().toLowerCase(),
  );
