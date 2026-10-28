import { type PermissionFlagType } from 'twenty-shared/constants';
import { typedObjectEntries } from 'twenty-shared/utils';

import {
  type LegacyStandardPermissionFlagKey,
  PERMISSION_FLAG_TYPE_BY_LEGACY_STANDARD_KEY,
} from 'src/engine/metadata-modules/permission-flag/constants/permission-flag-type-by-legacy-standard-key.constant';

// Old clients still read the pre-2.53 keys; delete once
// upgrade:2-53:rename-app-permission-flag-keys leaves the cross-upgrade window
export const addLegacyStandardPermissionFlagKeys = (
  permissionFlags: PermissionFlagType[],
): (PermissionFlagType | LegacyStandardPermissionFlagKey)[] => [
  ...permissionFlags,
  ...typedObjectEntries(PERMISSION_FLAG_TYPE_BY_LEGACY_STANDARD_KEY)
    .filter(([, permissionFlagType]) =>
      permissionFlags.includes(permissionFlagType),
    )
    .map(([legacyKey]) => legacyKey),
];
