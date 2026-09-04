export function calculateGrowthPercentage(prev: number, cur: number): number {
  if (prev === 0) return cur > 0 ? 100 : 0;
  return Number((((cur - prev) / Math.abs(prev)) * 100).toFixed(1));
}