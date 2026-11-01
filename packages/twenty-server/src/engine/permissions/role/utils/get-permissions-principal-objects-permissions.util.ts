/* @license Enterprise */

import { type ObjectsPermissions } from 'twenty-shared/types';

import { type PermissionsEnvironment } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import { computeObjectsPermissionsForRolePermissionConfig } from 'src/engine/permissions/role/utils/compute-objects-permissions-for-role-permission-config.util';

const objectsPermissionsByEnvironmentByPrincipal = new WeakMap<
  PermissionsPrincipal,
  WeakMap<PermissionsEnvironment, ObjectsPermissions>
>();

export const getPermissionsPrincipalObjectsPermissions = ({
  principal,
  environment,
}: {
  principal: PermissionsPrincipal;
  environment: PermissionsEnvironment;
}): ObjectsPermissions => {
  const objectsPermissionsByEnvironment =
    objectsPermissionsByEnvironmentByPrincipal.get(principal) ??
    new WeakMap<PermissionsEnvironment, ObjectsPermissions>();

  objectsPermissionsByEnvironmentByPrincipal.set(
    principal,
    objectsPermissionsByEnvironment,
  );

  const cachedObjectsPermissions =
    objectsPermissionsByEnvironment.get(environment);

  if (cachedObjectsPermissions !== undefined) {
    return cachedObjectsPermissions;
  }

  const objectsPermissions = computeObjectsPermissionsForRolePermissionConfig({
    intersectionOf: principal.intersectionOf,
    rolesPermissions: environment.rolesPermissions,
    flatObjectMetadataMaps: environment.flatObjectMetadataMaps,
    flatFieldMetadataMaps: environment.flatFieldMetadataMaps,
    flatApplicationMaps: environment.flatApplicationMaps,
  });

  objectsPermissionsByEnvironment.set(environment, objectsPermissions);

  return objectsPermissions;
};
