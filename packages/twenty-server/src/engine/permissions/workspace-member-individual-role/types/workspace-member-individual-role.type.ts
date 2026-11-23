import { type RoleManifest } from 'twenty-shared/application';

import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export type ApiKeysIndividualRoleWriteGrants = Pick<
  FlatRole,
  | 'canCreateAllObjectRecords'
  | 'canUpdateAllObjectRecords'
  | 'canSoftDeleteAllObjectRecords'
  | 'canDestroyAllObjectRecords'
>;

export type WorkspaceMemberIndividualRoleHolder =
  | { type: 'userWorkspace'; userWorkspaceId: string }
  | { type: 'apiKeys'; writeGrants: ApiKeysIndividualRoleWriteGrants };

export type WorkspaceMemberIndividualRole = {
  holder: WorkspaceMemberIndividualRoleHolder;
  recordsPermissions: RoleManifest['recordsPermissions'];
};
