// Release dates are authored as ISO yyyy-mm-dd. Render them in the page's
// locale (the old site hardcoded en-US; the redone localizes), parsed as UTC
// so the day never shifts across timezones.
export function formatReleaseDate(isoDate: string, locale: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) {
    return '';
  }
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
