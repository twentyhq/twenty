import { isDefined } from 'twenty-shared/utils';

export function formatCompactCount(
  value: number | null,
  locale: string,
): string | null {
  if (!isDefined(value)) return null;
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
