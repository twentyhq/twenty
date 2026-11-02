/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type RepositoryPermissionConfig } from 'src/engine/permissions/principal/types/role-permission-config.type';
import { getPermissionsPrincipalsFromAuthContext } from 'src/engine/permissions/principal/utils/get-permissions-principals-from-auth-context.util';

export const resolveRepositoryPermissionConfig = (
  authContext: WorkspaceAuthContext,
): RepositoryPermissionConfig | undefined => {
  if (isSystemAuthContext(authContext)) {
    return { shouldBypassPermissionChecks: true };
  }

  const principals = getPermissionsPrincipalsFromAuthContext(authContext);

  return isDefined(principals) ? { principals } : undefined;
};
