export function validateCronExpression(cron: string): boolean {
  const parts = cron.trim().split(/\s+/);
  return parts.length === 5 && parts.every(p => /^[0-9*,\/-]+$/.test(p));
}