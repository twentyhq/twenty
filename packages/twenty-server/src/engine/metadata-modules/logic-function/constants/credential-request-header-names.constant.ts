// App code gets a scoped token from the executor, so the caller's Twenty
// credentials must never reach it. Server routes, which Twenty never
// authenticates, may still forward a third-party authorization header.
export const CREDENTIAL_REQUEST_HEADER_NAMES = new Set([
  'authorization',
  'cookie',
  'proxy-authorization',
]);
