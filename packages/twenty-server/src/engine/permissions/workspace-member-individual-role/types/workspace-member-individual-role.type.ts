import { type RoleManifest } from 'twenty-shared/application';

export type WorkspaceMemberIndividualRoleHolder =
  | { type: 'userWorkspace'; userWorkspaceId: string }
  | { type: 'apiKeys' };

export type WorkspaceMemberIndividualRole = {
  holder: WorkspaceMemberIndividualRoleHolder;
  recordsPermissions: RoleManifest['recordsPermissions'];
};
