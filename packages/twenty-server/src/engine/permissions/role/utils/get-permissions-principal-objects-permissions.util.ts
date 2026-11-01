/* @license Enterprise */

import { type ObjectsPermissions } from 'twenty-shared/types';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import { computeObjectsPermissionsForRolePermissionConfig } from 'src/engine/permissions/role/utils/compute-objects-permissions-for-role-permission-config.util';

const objectsPermissionsByMetadataMapsByPrincipal = new WeakMap<
  PermissionsPrincipal,
  WeakMap<PermissionsMetadataMaps, ObjectsPermissions>
>();

export const getPermissionsPrincipalObjectsPermissions = ({
  principal,
  metadataMaps,
}: {
  principal: PermissionsPrincipal;
  metadataMaps: PermissionsMetadataMaps;
}): ObjectsPermissions => {
  const objectsPermissionsByMetadataMaps =
    objectsPermissionsByMetadataMapsByPrincipal.get(principal) ??
    new WeakMap<PermissionsMetadataMaps, ObjectsPermissions>();

  objectsPermissionsByMetadataMapsByPrincipal.set(
    principal,
    objectsPermissionsByMetadataMaps,
  );

  const cachedObjectsPermissions =
    objectsPermissionsByMetadataMaps.get(metadataMaps);

  if (cachedObjectsPermissions !== undefined) {
    return cachedObjectsPermissions;
  }

  const objectsPermissions = computeObjectsPermissionsForRolePermissionConfig({
    intersectionOf: principal.intersectionOf,
    rolesPermissions: metadataMaps.rolesPermissions,
    flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    flatApplicationMaps: metadataMaps.flatApplicationMaps,
  });

  objectsPermissionsByMetadataMaps.set(metadataMaps, objectsPermissions);

  return objectsPermissions;
};
