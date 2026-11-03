import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { getPermissionsPrincipalsFromAuthContext } from 'src/engine/permissions/principal/utils/get-permissions-principals-from-auth-context.util';
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

export const resolveObjectRecordsPermissions = ({
  authContext,
  roleMaps,
  objectPermissionsByRoleId,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  authContext: WorkspaceAuthContext;
  roleMaps: PermissionsPrincipalRoleMaps;
  objectPermissionsByRoleId: ObjectsPermissionsByRoleId;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): ObjectRecordsPermissionsResolution => {
  if (isSystemAuthContext(authContext)) {
    return {
      objectRecordsPermissions: {},
      shouldBypassPermissionChecks: true,
      permissionsPrincipal: undefined,
    };
  }

  const principals = getPermissionsPrincipalsFromAuthContext(authContext);
  const permissionsPrincipal = isDefined(principals)
    ? resolvePermissionsPrincipalsWithRoles({
        principalsContext: principals,
        roleMaps,
      })
    : undefined;

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
      rolesPermissions: objectPermissionsByRoleId,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatApplicationMaps: roleMaps.flatApplicationMaps,
    }),
    shouldBypassPermissionChecks: false,
    permissionsPrincipal,
  };
};
