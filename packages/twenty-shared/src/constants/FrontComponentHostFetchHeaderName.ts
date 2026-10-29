// Transitional: lets the server deny the session cookie to front components while older bundles still omit the opt-in header.
export const FRONT_COMPONENT_HOST_FETCH_HEADER_NAME =
  'x-twenty-front-component-host-fetch';
