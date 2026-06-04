const FULL_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const COMPACT_FORMATTER = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export const formatUsdRate = (usd: number | null): string | null => {
  if (usd === null || Number.isNaN(usd)) return null;
  return FULL_FORMATTER.format(usd);
};

export const formatUsdCompact = (usd: number | null): string | null => {
  if (usd === null || Number.isNaN(usd)) return null;
  return COMPACT_FORMATTER.format(usd);
};
