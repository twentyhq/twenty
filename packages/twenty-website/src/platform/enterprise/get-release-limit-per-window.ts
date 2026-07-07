const DEFAULT_RELEASE_LIMIT_PER_WINDOW = 10;

export function getReleaseLimitPerWindow(): number {
  const value = process.env.ENTERPRISE_RELEASE_LIMIT_PER_WINDOW;

  if (value === undefined || value === '') {
    return DEFAULT_RELEASE_LIMIT_PER_WINDOW;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return DEFAULT_RELEASE_LIMIT_PER_WINDOW;
  }

  return parsed;
}
