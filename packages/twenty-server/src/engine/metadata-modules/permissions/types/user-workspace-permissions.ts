import { type PermissionsOnAllObjectRecords } from 'twenty-shared/constants';
import {
  type ObjectsPermissions,
  type ObjectsPermissionsDeprecated,
} from 'twenty-shared/types';

import { type PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';

export type UserWorkspacePermissions = {
  permissionFlags: Record<PermissionFlagType, boolean>;
  objectRecordsPermissions: Record<PermissionsOnAllObjectRecords, boolean>;
  objectPermissions: ObjectsPermissionsDeprecated;
  objectsPermissions: ObjectsPermissions; // replaces ObjectsPermissionsDeprecated - deprecation ongoing
};
