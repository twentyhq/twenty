import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { computeObjectsPermissionsForRolePermissionConfig } from 'src/engine/twenty-orm/utils/compute-objects-permissions-for-role-permission-config.util';
import { type ApplicationDefaultRoleMaps } from 'src/engine/twenty-orm/types/application-default-role-maps.type';

export const getObjectsPermissionsFromRolePermissionConfig = ({
  rolesPermissions,
  rolePermissionConfig,
  flatObjectMetadataMaps,
  flatApplicationMaps,
}: {
  rolesPermissions: ObjectsPermissionsByRoleId;
  rolePermissionConfig: RolePermissionConfig;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatApplicationMaps: ApplicationDefaultRoleMaps;
}): ObjectsPermissions => {
  if ('shouldBypassPermissionChecks' in rolePermissionConfig) {
    return {};
  }

  return computeObjectsPermissionsForRolePermissionConfig({
    intersectionOf: rolePermissionConfig.intersectionOf,
    rolesPermissions,
    flatObjectMetadataMaps,
    flatApplicationMaps,
  });
};
