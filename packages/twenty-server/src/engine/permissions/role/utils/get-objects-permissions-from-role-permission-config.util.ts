import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RepositoryPermissionConfig } from 'src/engine/permissions/principal/types/role-permission-config.type';
import { computeObjectsPermissionsForRoles } from 'src/engine/permissions/role/utils/compute-objects-permissions-for-roles.util';
import { buildPermissionsPrincipalsWithRolesFromConfig } from 'src/engine/permissions/principal/utils/build-permissions-principals-with-roles-from-config.util';
import { type PermissionsPrincipalsContext } from 'src/engine/permissions/principal/types/permissions-principals-context.type';
import { type PermissionsPrincipalRoleMaps } from 'src/engine/permissions/principal/utils/resolve-permissions-principals-with-roles.util';

export const getObjectsPermissionsFromRolePermissionConfig = ({
  workspaceId,
  rolesPermissions,
  rolePermissionConfig,
  principals,
  roleMaps,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  workspaceId: string;
  rolesPermissions: ObjectsPermissionsByRoleId;
  rolePermissionConfig: RepositoryPermissionConfig;
  principals: PermissionsPrincipalsContext | undefined;
  roleMaps: PermissionsPrincipalRoleMaps;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): ObjectsPermissions => {
  const principal = buildPermissionsPrincipalsWithRolesFromConfig({
    workspaceId,
    rolePermissionConfig,
    principalsContext: principals,
    roleMaps,
  });

  if (!isDefined(principal)) {
    return {};
  }

  return computeObjectsPermissionsForRoles({
    principal,
    rolesPermissions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatApplicationMaps: roleMaps.flatApplicationMaps,
  });
};
