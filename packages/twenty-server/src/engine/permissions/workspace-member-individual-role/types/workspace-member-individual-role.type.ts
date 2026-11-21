import { type RoleManifest } from 'twenty-shared/application';

export type WorkspaceMemberIndividualRole = {
  userWorkspaceId: string;
  recordsPermissions: RoleManifest['recordsPermissions'];
};
