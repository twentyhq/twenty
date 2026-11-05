import { type PermissionFlagType } from 'twenty-shared/constants';

import { type UserWorkspacePermissions } from 'src/engine/permissions/types/user-workspace-permissions.type';

// TODO(@charlesBochet): deprecate AI run scopes, they limit a run without being a role or a principal
// A limit written inline on an AI run rather than stored as a role, resolved like a member's permissions
export type AiRunPermissionScope = Pick<
  UserWorkspacePermissions,
  'recordsPermissions'
> & {
  permissionFlags: Partial<Record<PermissionFlagType, boolean>>;
};
