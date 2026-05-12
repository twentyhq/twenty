import { type ObjectsPermissions } from 'twenty-shared/types';
import { type PermissionFlagType } from 'twenty-shared/constants';

export type UserWorkspacePermissions = {
  permissionFlagGrants: Record<PermissionFlagType, boolean>;
  objectsPermissions: ObjectsPermissions;
};
