const DEFAULT_VALIDITY_TOKEN_EMISSIONS_PER_WINDOW = 2;

export function getValidityTokenEmissionLimitPerWindow(): number {
  const value = process.env.ENTERPRISE_VALIDITY_TOKEN_EMISSIONS_PER_DAY;

  if (value === undefined || value === '') {
    return DEFAULT_VALIDITY_TOKEN_EMISSIONS_PER_WINDOW;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return DEFAULT_VALIDITY_TOKEN_EMISSIONS_PER_WINDOW;
  }

  return parsed;
}
