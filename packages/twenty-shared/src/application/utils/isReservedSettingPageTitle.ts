// The application settings page always renders its own General page first, so an
// application declaring that title would produce two pages named the same.
export const RESERVED_SETTING_PAGE_TITLES = ['General'] as const;

export const isReservedSettingPageTitle = (title: string): boolean =>
  RESERVED_SETTING_PAGE_TITLES.some(
    (reservedTitle) =>
      reservedTitle.toLowerCase() === title.trim().toLowerCase(),
  );
