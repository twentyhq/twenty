import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

export type UserWorkspacePermissionsDto = Pick<
  UserWorkspaceEntity,
  | 'objectRecordsPermissions'
  | 'objectPermissions'
  | 'objectsPermissions'
  | 'permissionFlags'
>;
