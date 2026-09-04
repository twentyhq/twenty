export function calculateWeightedMovingAverage(values: number[], weights: number[]): number {
  if (!values.length || values.length !== weights.length) return 0;
  const wSum = weights.reduce((a, b) => a + b, 0);
  if (!wSum) return 0;
  const sum = values.reduce((acc, v, i) => acc + v * weights[i], 0);
  return Number((sum / wSum).toFixed(2));
}