// The secure/insecure cookie branch is decided by configuration, never by the
// transport: isSecureDeployment() reads SERVER_URL, which is env-only and so
// cannot be flipped at runtime the way the SameSite=None side door can.
export const IS_SECURE_DEPLOYMENT = (process.env.SERVER_URL ?? '').startsWith(
  'https://',
);
