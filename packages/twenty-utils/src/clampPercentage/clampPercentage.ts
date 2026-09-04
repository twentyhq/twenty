export function clampPercentage(val: number): number {
  return Math.min(100, Math.max(0, val));
}