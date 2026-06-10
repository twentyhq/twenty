// 49600 -> "49.6K", 6600 -> "6.6K" — locale-independent so the chips read
// identically everywhere.
export const formatCompactCount = (value: number): string =>
  new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
