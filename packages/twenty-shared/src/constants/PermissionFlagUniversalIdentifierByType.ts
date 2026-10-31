import { SystemPermissionFlag } from './SystemPermissionFlag';

// keyed by string, so a flag type read from the API needs no cast to be looked up
export const PERMISSION_FLAG_UNIVERSAL_IDENTIFIER_BY_TYPE = new Map<
  string,
  string
>(Object.entries(SystemPermissionFlag));
