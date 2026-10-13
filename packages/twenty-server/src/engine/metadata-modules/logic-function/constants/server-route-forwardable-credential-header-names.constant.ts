// Twenty never authenticates server routes, so an Authorization header there
// is the credential of the third party calling the app, not a Twenty session.
export const SERVER_ROUTE_FORWARDABLE_CREDENTIAL_HEADER_NAMES = new Set([
  'authorization',
]);
