// Set by the host page on the requests it forwards for a sandboxed front component.
// The server ignores the user session cookie on these, so app code cannot act with the user's session.
export const FRONT_COMPONENT_HOST_FETCH_HEADER_NAME =
  'x-twenty-front-component-host-fetch';
