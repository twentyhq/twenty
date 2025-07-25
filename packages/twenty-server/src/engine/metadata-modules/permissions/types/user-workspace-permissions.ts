import { PermissionsOnAllObjectRecords } from 'twenty-shared/constants';
import { ObjectRecordsPermissions } from 'twenty-shared/types';

import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';

export type UserWorkspacePermissions = {
  permissionFlags: Record<PermissionFlagType, boolean>;
  objectRecordsPermissions: Record<PermissionsOnAllObjectRecords, boolean>;
  objectPermissions: ObjectRecordsPermissions;
};
