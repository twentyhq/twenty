export function calculateChurnProbability(inactiveDays: number, openTickets: number, npsScore: number): number {
  let risk = (inactiveDays / 90) * 0.4 + (openTickets / 10) * 0.3 + ((10 - npsScore) / 10) * 0.3;
  return Math.min(1.0, Math.max(0.0, Number(risk.toFixed(2))));
}