/* @license Enterprise */

import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import { computeObjectsPermissionsForRoles } from 'src/engine/permissions/role/utils/compute-objects-permissions-for-roles.util';

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

  if (isDefined(cachedObjectsPermissions)) {
    return cachedObjectsPermissions;
  }

  const objectsPermissions = computeObjectsPermissionsForRoles({
    roleIds: principal.roleIds,
    applicationId: principal.applicationId,
    rolesPermissions: metadataMaps.rolesPermissions,
    flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    flatApplicationMaps: metadataMaps.flatApplicationMaps,
  });

  objectsPermissionsByMetadataMaps.set(metadataMaps, objectsPermissions);

  return objectsPermissions;
};
