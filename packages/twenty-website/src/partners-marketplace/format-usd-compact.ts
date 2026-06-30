const COMPACT_FORMATTER = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

// Compact USD for the marketplace pricing pills ($140/hr, from $8K). A null
// amount (the partner left the rate unset) returns null so the caller can omit
// the pill entirely rather than render "$0".
export const formatUsdCompact = (usd: number | null): string | null => {
  if (usd === null || Number.isNaN(usd)) return null;
  return COMPACT_FORMATTER.format(usd);
};
