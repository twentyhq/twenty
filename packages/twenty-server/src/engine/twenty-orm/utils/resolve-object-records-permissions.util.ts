import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { computeObjectsPermissionsForRolePermissionConfig } from 'src/engine/twenty-orm/utils/compute-objects-permissions-for-role-permission-config.util';

export const resolveObjectRecordsPermissions = ({
  rolePermissionConfig,
  objectPermissionsByRoleId,
  flatObjectMetadataMaps,
  flatRoleMaps,
}: {
  rolePermissionConfig?: RolePermissionConfig;
  objectPermissionsByRoleId: ObjectsPermissionsByRoleId;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatRoleMaps: FlatRoleMaps;
}): {
  objectRecordsPermissions: ObjectsPermissions;
  shouldBypassPermissionChecks: boolean;
} => {
  if (!isDefined(rolePermissionConfig)) {
    return {
      objectRecordsPermissions: {},
      shouldBypassPermissionChecks: false,
    };
  }

  if ('shouldBypassPermissionChecks' in rolePermissionConfig) {
    return {
      objectRecordsPermissions: {},
      shouldBypassPermissionChecks:
        rolePermissionConfig.shouldBypassPermissionChecks,
    };
  }

  return {
    objectRecordsPermissions: computeObjectsPermissionsForRolePermissionConfig({
      intersectionOf: rolePermissionConfig.intersectionOf,
      rolesPermissions: objectPermissionsByRoleId,
      flatObjectMetadataMaps,
      flatRoleMaps,
    }),
    shouldBypassPermissionChecks: false,
  };
};
