export function exponentialJitterBackoff(attempt: number, baseMs = 100, maxMs = 5000): number {
  const temp = Math.min(maxMs, baseMs * Math.pow(2, attempt));
  return Math.floor(Math.random() * temp);
}