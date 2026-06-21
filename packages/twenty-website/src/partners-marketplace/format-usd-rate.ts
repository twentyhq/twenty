const RATE_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

// Full USD for the profile rates panel ($140, $25,000) — unlike the card's
// compact pills. A null amount returns null so the caller drops the row.
export const formatUsdRate = (usd: number | null): string | null => {
  if (usd === null || Number.isNaN(usd)) return null;
  return RATE_FORMATTER.format(usd);
};
