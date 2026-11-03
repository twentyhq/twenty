import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { buildPermissionsPrincipalRoleMaps } from 'src/engine/permissions/principal/utils/build-permissions-principal-role-maps.util';
import { resolvePermissionsPrincipalsWithRoles } from 'src/engine/permissions/principal/utils/resolve-permissions-principals-with-roles.util';
import { computeObjectsPermissionsForRoles } from 'src/engine/permissions/role/utils/compute-objects-permissions-for-roles.util';
import { type ORMWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';

export type ObjectRecordsPermissionsResolution = {
  objectRecordsPermissions: ObjectsPermissions;
  shouldBypassPermissionChecks: boolean;
  permissionsPrincipal: PermissionsPrincipalsWithRolesContext | undefined;
};

export type ObjectRecordsPermissionsWorkspaceContext = Pick<
  ORMWorkspaceContext,
  | 'authContext'
  | 'permissionsPerRoleId'
  | 'flatObjectMetadataMaps'
  | 'flatFieldMetadataMaps'
  | 'flatWorkspaceMemberMaps'
  | 'userWorkspaceRoleMap'
  | 'apiKeyRoleMap'
  | 'flatRoleTargetByAgentIdMaps'
  | 'flatApplicationMaps'
>;

// A workspace context is replaced, never mutated, so it can key the resolution
const resolutionByWorkspaceContext = new WeakMap<
  ObjectRecordsPermissionsWorkspaceContext,
  ObjectRecordsPermissionsResolution
>();

const computeObjectRecordsPermissions = (
  workspaceContext: ObjectRecordsPermissionsWorkspaceContext,
): ObjectRecordsPermissionsResolution => {
  const { authContext } = workspaceContext;

  if (isSystemAuthContext(authContext)) {
    return {
      objectRecordsPermissions: {},
      shouldBypassPermissionChecks: true,
      permissionsPrincipal: undefined,
    };
  }

  const permissionsPrincipal = resolvePermissionsPrincipalsWithRoles({
    authContext,
    roleMaps: buildPermissionsPrincipalRoleMaps(workspaceContext),
  });

  if (!isDefined(permissionsPrincipal)) {
    return {
      objectRecordsPermissions: {},
      shouldBypassPermissionChecks: false,
      permissionsPrincipal: undefined,
    };
  }

  return {
    objectRecordsPermissions: computeObjectsPermissionsForRoles({
      principal: permissionsPrincipal,
      rolesPermissions: workspaceContext.permissionsPerRoleId,
      flatObjectMetadataMaps: workspaceContext.flatObjectMetadataMaps,
      flatFieldMetadataMaps: workspaceContext.flatFieldMetadataMaps,
      flatApplicationMaps: workspaceContext.flatApplicationMaps,
    }),
    shouldBypassPermissionChecks: false,
    permissionsPrincipal,
  };
};

export const resolveObjectRecordsPermissions = ({
  workspaceContext,
}: {
  workspaceContext: ObjectRecordsPermissionsWorkspaceContext;
}): ObjectRecordsPermissionsResolution => {
  const cachedResolution = resolutionByWorkspaceContext.get(workspaceContext);

  if (isDefined(cachedResolution)) {
    return cachedResolution;
  }

  const resolution = computeObjectRecordsPermissions(workspaceContext);

  resolutionByWorkspaceContext.set(workspaceContext, resolution);

  return resolution;
};
