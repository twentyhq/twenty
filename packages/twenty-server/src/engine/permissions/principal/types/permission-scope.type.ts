import { type PermissionFlagType } from 'twenty-shared/constants';

import { type UserWorkspacePermissions } from 'src/engine/permissions/types/user-workspace-permissions.type';

// A restriction written inline on an AI run rather than stored as a role, resolved like a member's permissions
export type PermissionScope = Pick<
  UserWorkspacePermissions,
  'objectsPermissions'
> & {
  permissionFlags: Partial<Record<PermissionFlagType, boolean>>;
};
