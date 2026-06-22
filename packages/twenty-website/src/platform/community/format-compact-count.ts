// 49600 -> "49.6K" (en) / "49,6 k" (fr) — compact notation in the visitor's
// locale, like every other number on the site.
export function formatCompactCount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
