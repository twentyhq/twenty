/**
 * @see https://developers.google.com/identity/protocols/oauth2/web-server#authorization-errors
 */
export const GOOGLE_PERMANENT_OAUTH_ERROR_CODES = new Set([
  'invalid_grant',
  'invalid_client',
  'unauthorized_client',
  'unsupported_grant_type',
  'invalid_scope',
  'admin_policy_enforced',
]);
