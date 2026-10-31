import { type PermissionFlagType } from 'twenty-shared/constants';
import { type ObjectsPermissions } from 'twenty-shared/types';

// A restriction written inline on an AI run rather than stored as a role
export type PermissionScope = {
  objectsPermissions: ObjectsPermissions;
  grantedPermissionFlags: PermissionFlagType[];
};
