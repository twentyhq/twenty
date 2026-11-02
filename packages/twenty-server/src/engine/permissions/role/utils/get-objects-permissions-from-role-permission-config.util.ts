import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RolePermissionConfig } from 'src/engine/permissions/principal/types/role-permission-config.type';
import { computeObjectsPermissionsForRoles } from 'src/engine/permissions/role/utils/compute-objects-permissions-for-roles.util';
import { type ApplicationDefaultRoleMaps } from 'src/engine/permissions/principal/types/application-default-role-maps.type';
import { getRoleIdsToIntersect } from 'src/engine/permissions/principal/utils/get-role-ids-to-intersect.util';
import { resolvePermissionsPrincipalActingApplicationId } from 'src/engine/permissions/principal/utils/resolve-permissions-principal-acting-application-id.util';

export const getObjectsPermissionsFromRolePermissionConfig = ({
  rolesPermissions,
  rolePermissionConfig,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatApplicationMaps,
}: {
  rolesPermissions: ObjectsPermissionsByRoleId;
  rolePermissionConfig: RolePermissionConfig;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatApplicationMaps: ApplicationDefaultRoleMaps;
}): ObjectsPermissions => {
  if ('shouldBypassPermissionChecks' in rolePermissionConfig) {
    return {};
  }

  const { intersectionOf } = rolePermissionConfig;

  return computeObjectsPermissionsForRoles({
    roleIds: getRoleIdsToIntersect(intersectionOf) ?? [],
    applicationId: resolvePermissionsPrincipalActingApplicationId({
      intersectionOf,
      flatApplicationMaps,
    }),
    rolesPermissions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatApplicationMaps,
  });
};
