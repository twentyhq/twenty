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

// .env.test enables IS_MULTIWORKSPACE_ENABLED, so workspaces are served on
// subdomains of FRONTEND_URL. Origins of existing workspaces (the apple seed)
// are allowed via the workspace registry; unknown siblings stay denied.
const buildFrontSubdomainOrigin = (subdomain: string): string => {
  const url = new URL(ALLOWED_ORIGIN);

  url.hostname = `${subdomain}.${url.hostname}`;

  return url.origin;
};

export const SEEDED_WORKSPACE_SUBDOMAIN_ORIGIN =
  buildFrontSubdomainOrigin('apple');

export const UNKNOWN_WORKSPACE_SUBDOMAIN_ORIGIN =
  buildFrontSubdomainOrigin('not-a-workspace');
