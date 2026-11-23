import { type RoleManifest } from 'twenty-shared/application';

export type WorkspaceMemberIndividualRoleHolder =
  | { type: 'userWorkspace'; userWorkspaceId: string }
  // TODO(@charlesBochet): remove the API key channel visibility exemption after 2026-11-30
  | { type: 'apiKeys' };

export type WorkspaceMemberIndividualRole = {
  holder: WorkspaceMemberIndividualRoleHolder;
  recordsPermissions: RoleManifest['recordsPermissions'];
};
