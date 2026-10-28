import { PermissionFlagType } from 'twenty-shared/constants';

// Keys standard flags held before 2.53. They stay reserved: stale clients still
// send them and reverting the 2-53 rename restores them.
export const PERMISSION_FLAG_TYPE_BY_LEGACY_STANDARD_KEY = {
  CONNECTED_ACCOUNTS: PermissionFlagType.USER_APPS,
  APPLICATIONS: PermissionFlagType.WORKSPACE_APPS,
} as const satisfies Record<string, PermissionFlagType>;
