// Machine codes returned to clients when a rate limit is hit, so the
// self-hosted server and admin UI can surface the right message.
export const ENTERPRISE_RATE_LIMIT_CODE = {
  RELEASE: 'ENTERPRISE_RELEASE_RATE_LIMITED',
  VALIDITY_TOKEN: 'ENTERPRISE_VALIDITY_TOKEN_RATE_LIMITED',
} as const;
