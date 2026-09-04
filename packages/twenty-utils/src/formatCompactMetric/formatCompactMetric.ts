export function formatCompactMetric(val: number, prefix = "$"): string {
  if (Math.abs(val) >= 1000000) return `${prefix}${(val / 1000000).toFixed(1)}M`;
  if (Math.abs(val) >= 1000) return `${prefix}${(val / 1000).toFixed(1)}k`;
  return `${prefix}${val}`;
}