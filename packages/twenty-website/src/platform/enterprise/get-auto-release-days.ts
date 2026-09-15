const DEFAULT_AUTO_RELEASE_DAYS = 14;

export function getAutoReleaseDays(): number {
  const value = process.env.ENTERPRISE_AUTO_RELEASE_DAYS;

  if (value === undefined || value === '') {
    return DEFAULT_AUTO_RELEASE_DAYS;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return DEFAULT_AUTO_RELEASE_DAYS;
  }

  return parsed;
}
