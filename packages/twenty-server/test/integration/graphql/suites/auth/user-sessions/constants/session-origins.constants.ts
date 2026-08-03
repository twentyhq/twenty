// The cookie-issuance gate and the CSRF middleware allowlist FRONTEND_URL
// (resolveAllowedCredentialedOrigins), which .env.test sets to
// http://localhost:3001. Deriving it here keeps the suite honest if the test
// environment ever moves.
export const ALLOWED_ORIGIN =
  process.env.FRONTEND_URL ?? 'http://localhost:3001';

export const DISALLOWED_ORIGIN = 'https://attacker.example.com';
