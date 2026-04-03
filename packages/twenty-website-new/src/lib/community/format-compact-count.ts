export function formatCompactCount(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return '';
  }

  if (value < 1000) {
    return String(Math.round(value));
  }

  if (value < 1_000_000) {
    const thousands = value / 1000;
    const roundedToTenth = Math.round(thousands * 10) / 10;
    return `${roundedToTenth.toFixed(1)}K`;
  }

  const millions = value / 1_000_000;
  const roundedToTenthM = Math.round(millions * 10) / 10;
  return `${roundedToTenthM.toFixed(1)}M`;
}
