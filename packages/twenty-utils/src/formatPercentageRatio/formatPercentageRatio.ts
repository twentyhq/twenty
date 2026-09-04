export function formatPercentageRatio(ratio: number, decimals = 1, showSign = false): string {
  const pct = (ratio * 100).toFixed(decimals);
  const sign = showSign && ratio > 0 ? "+" : "";
  return `${sign}${pct}%`;
}