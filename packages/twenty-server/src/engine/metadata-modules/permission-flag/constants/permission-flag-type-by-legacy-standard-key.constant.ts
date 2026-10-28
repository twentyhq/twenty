import { PermissionFlagType } from 'twenty-shared/constants';

// Pre-2.53 standard keys stay reserved: reverting the 2-53 rename restores them
export const PERMISSION_FLAG_TYPE_BY_LEGACY_STANDARD_KEY = {
  CONNECTED_ACCOUNTS: PermissionFlagType.USER_APPS,
  APPLICATIONS: PermissionFlagType.WORKSPACE_APPS,
} as const satisfies Record<string, PermissionFlagType>;

export type LegacyStandardPermissionFlagKey =
  keyof typeof PERMISSION_FLAG_TYPE_BY_LEGACY_STANDARD_KEY;
