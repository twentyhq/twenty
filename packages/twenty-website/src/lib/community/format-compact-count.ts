const compactFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

export function formatCompactCount(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '';
  return compactFormatter.format(value);
}
