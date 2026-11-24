import { type RoleManifest } from 'twenty-shared/application';

import { type UnreadableNestedFieldDeclaration } from 'src/engine/core-modules/application/application-manifest/converters/from-role-manifest-to-universal-flat-records-permissions.util';

export type WorkspaceMemberIndividualRoleHolder =
  | { type: 'userWorkspace'; userWorkspaceId: string }
  // TODO(@charlesBochet): remove the API key channel visibility exemption after 2026-11-30
  | { type: 'apiKeys' };

export type WorkspaceMemberIndividualRole = {
  holder: WorkspaceMemberIndividualRoleHolder;
  recordsPermissions: RoleManifest['recordsPermissions'];
  unreadableNestedFields?: UnreadableNestedFieldDeclaration[];
};
