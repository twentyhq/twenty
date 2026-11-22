import { type UserWorkspacePermissions } from 'src/engine/permissions/types/user-workspace-permissions.type';

export type CurrentUserWorkspacePermissions = UserWorkspacePermissions & {
  objectMetadataIdsWithReadableRecords: Set<string>;
};
