import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { buildPermissionsPrincipalRoleMaps } from 'src/engine/permissions/principal/utils/build-permissions-principal-role-maps.util';
import {
  type PermissionsPrincipalRoleMaps,
  resolvePermissionsPrincipalsWithRoles,
} from 'src/engine/permissions/principal/utils/resolve-permissions-principals-with-roles.util';
import { computeObjectsPermissionsForRoles } from 'src/engine/permissions/role/utils/compute-objects-permissions-for-roles.util';

export type ObjectRecordsPermissionsResolution = {
  objectRecordsPermissions: ObjectsPermissions;
  shouldBypassPermissionChecks: boolean;
  permissionsPrincipal: PermissionsPrincipalsWithRolesContext | undefined;
};

export type ObjectRecordsPermissionsWorkspaceContext = Omit<
  PermissionsPrincipalRoleMaps,
  'flatWorkspaceMemberMaps' | 'flatRoleTargetMaps'
> & {
  authContext: PermissionsAuthContext;
  permissionsPerRoleId: ObjectsPermissionsByRoleId;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatWorkspaceMemberMaps?: FlatWorkspaceMemberMaps;
};

// A workspace context is replaced, never mutated, so it can key the resolution
const resolutionByWorkspaceContext = new WeakMap<
  ObjectRecordsPermissionsWorkspaceContext,
  ObjectRecordsPermissionsResolution
>();

const computeObjectRecordsPermissions = (
  workspaceContext: ObjectRecordsPermissionsWorkspaceContext,
): ObjectRecordsPermissionsResolution => {
  const { authContext } = workspaceContext;

  if (authContext.type === 'system') {
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
