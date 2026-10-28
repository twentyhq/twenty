import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { type PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';

const PERMISSION_FLAG_TYPE_BY_UNIVERSAL_IDENTIFIER = new Map<
  string,
  PermissionFlagType
>(
  Object.values(PermissionFlagType).map((permissionFlagType) => [
    SystemPermissionFlag[permissionFlagType],
    permissionFlagType,
  ]),
);

// Stored standard keys lag code keys until upgrade:2-53:rename-app-permission-flag-keys; remove after
export const resolvePermissionFlagKey = ({
  universalIdentifier,
  key,
}: Pick<PermissionFlagEntity, 'universalIdentifier' | 'key'>): string =>
  PERMISSION_FLAG_TYPE_BY_UNIVERSAL_IDENTIFIER.get(universalIdentifier) ?? key;
