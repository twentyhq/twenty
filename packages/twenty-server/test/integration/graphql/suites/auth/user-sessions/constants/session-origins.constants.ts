import { isNonEmptyString } from '@sniptt/guards';

// The cookie-issuance gate and the CSRF middleware allowlist FRONTEND_URL
// (resolveAllowedCredentialedOrigins), which .env.test sets to
// http://localhost:3001. Deriving it here keeps the suite honest if the test
// environment ever moves, and normalizing to URL.origin keeps the header
// aligned with the server-side comparison when FRONTEND_URL carries a path or
// trailing slash.
const resolveAllowedOrigin = (): string => {
  const frontendUrl = process.env.FRONTEND_URL;

  if (!isNonEmptyString(frontendUrl)) {
    return 'http://localhost:3001';
  }

  return new URL(frontendUrl).origin;
};

export const ALLOWED_ORIGIN = resolveAllowedOrigin();

export const DISALLOWED_ORIGIN = 'https://attacker.example.com';
