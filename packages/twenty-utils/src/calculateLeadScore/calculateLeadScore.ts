export interface LeadMetric { weight: number; score: number; }
export function calculateLeadScore(metrics: LeadMetric[]): number {
  let totalWeight = 0, weightedSum = 0;
  for (const m of metrics) { weightedSum += m.weight * m.score; totalWeight += m.weight; }
  return totalWeight === 0 ? 0 : Math.round(weightedSum / totalWeight);
}