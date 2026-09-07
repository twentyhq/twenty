const DEFAULT_GRACE_PERIOD_DAYS = 14;

export function getGracePeriodDays(): number {
  const value = process.env.ENTERPRISE_GRACE_PERIOD_DAYS;

  if (value === undefined || value === '') {
    return DEFAULT_GRACE_PERIOD_DAYS;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return DEFAULT_GRACE_PERIOD_DAYS;
  }

  return parsed;
}
