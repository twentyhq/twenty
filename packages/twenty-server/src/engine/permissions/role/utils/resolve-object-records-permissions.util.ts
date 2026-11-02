import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { type RepositoryPermissionConfig } from 'src/engine/permissions/principal/types/role-permission-config.type';
import { buildPermissionsPrincipalsWithRolesFromConfig } from 'src/engine/permissions/principal/utils/build-permissions-principals-with-roles-from-config.util';
import { getPermissionsPrincipalsFromAuthContext } from 'src/engine/permissions/principal/utils/get-permissions-principals-from-auth-context.util';
import { type PermissionsPrincipalRoleMaps } from 'src/engine/permissions/principal/utils/resolve-permissions-principals-with-roles.util';
import { computeObjectsPermissionsForRoles } from 'src/engine/permissions/role/utils/compute-objects-permissions-for-roles.util';

export const resolveObjectRecordsPermissions = ({
  rolePermissionConfig,
  authContext,
  roleMaps,
  objectPermissionsByRoleId,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  rolePermissionConfig?: RepositoryPermissionConfig;
  authContext: WorkspaceAuthContext;
  roleMaps: PermissionsPrincipalRoleMaps;
  objectPermissionsByRoleId: ObjectsPermissionsByRoleId;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): {
  objectRecordsPermissions: ObjectsPermissions;
  shouldBypassPermissionChecks: boolean;
  permissionsPrincipal: PermissionsPrincipalsWithRolesContext | undefined;
} => {
  if (!isDefined(rolePermissionConfig)) {
    return {
      objectRecordsPermissions: {},
      shouldBypassPermissionChecks: false,
      permissionsPrincipal: undefined,
    };
  }

  if ('shouldBypassPermissionChecks' in rolePermissionConfig) {
    return {
      objectRecordsPermissions: {},
      shouldBypassPermissionChecks:
        rolePermissionConfig.shouldBypassPermissionChecks,
      permissionsPrincipal: undefined,
    };
  }

  const permissionsPrincipal = buildPermissionsPrincipalsWithRolesFromConfig({
    workspaceId: authContext.workspace.id,
    rolePermissionConfig,
    principalsContext: getPermissionsPrincipalsFromAuthContext(authContext),
    roleMaps,
  });

  return {
    objectRecordsPermissions: isDefined(permissionsPrincipal)
      ? computeObjectsPermissionsForRoles({
          principal: permissionsPrincipal,
          rolesPermissions: objectPermissionsByRoleId,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          flatApplicationMaps: roleMaps.flatApplicationMaps,
        })
      : {},
    shouldBypassPermissionChecks: false,
    permissionsPrincipal,
  };
};
