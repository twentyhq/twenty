// App code gets a scoped token from the executor, so the caller's own
// credentials must never reach it, whatever the manifest forwards.
export const CREDENTIAL_REQUEST_HEADER_NAMES = new Set([
  'authorization',
  'cookie',
  'proxy-authorization',
]);
