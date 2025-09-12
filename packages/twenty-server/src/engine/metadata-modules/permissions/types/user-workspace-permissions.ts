import { type ObjectsPermissions } from 'twenty-shared/types';

import { type PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';

export type UserWorkspacePermissions = {
  permissionFlags: Record<PermissionFlagType, boolean>;
  objectsPermissions: ObjectsPermissions;
};
