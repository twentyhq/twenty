// Server routes are never authenticated by Twenty, so this is a third party's credential.
export const SERVER_ROUTE_FORWARDABLE_CREDENTIAL_HEADER_NAMES = new Set([
  'authorization',
]);
