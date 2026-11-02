/* @license Enterprise */

import { type PermissionScope } from 'src/engine/permissions/principal/types/permission-scope.type';

export type PermissionsPrincipal = {
  workspaceId: string;
  roleIds: string[];
  workspaceMemberId?: string;
  applicationId?: string;
  // narrows what the roles allow, and leaves no reach beyond them
  scope?: Pick<PermissionScope, 'objectsPermissions'>;
};
