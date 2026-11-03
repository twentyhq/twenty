import { type PermissionFlagType } from 'twenty-shared/constants';

import { type UserWorkspacePermissions } from 'src/engine/permissions/types/user-workspace-permissions.type';

// A role written inline on an AI run rather than stored, resolved like a member's permissions
export type PermissionsEphemeralRole = Pick<
  UserWorkspacePermissions,
  'objectsPermissions'
> & {
  permissionFlags: Partial<Record<PermissionFlagType, boolean>>;
};
