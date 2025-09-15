import { type UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

export type UserWorkspacePermissionsDto = Pick<
  UserWorkspace,
  'objectPermissions' | 'permissionFlags' | 'objectsPermissions'
>;
