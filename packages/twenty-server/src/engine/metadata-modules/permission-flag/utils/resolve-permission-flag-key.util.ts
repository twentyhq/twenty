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

// Standard rows keep their pre-rename key until the 2-53 permission flag key rename command
// reaches their workspace; delete once that command is past the cross-upgrade window
export const resolvePermissionFlagKey = ({
  universalIdentifier,
  key,
}: Pick<PermissionFlagEntity, 'universalIdentifier' | 'key'>): string =>
  PERMISSION_FLAG_TYPE_BY_UNIVERSAL_IDENTIFIER.get(universalIdentifier) ?? key;
