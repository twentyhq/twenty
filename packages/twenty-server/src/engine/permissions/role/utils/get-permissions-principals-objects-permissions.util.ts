/* @license Enterprise */

import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { computeObjectsPermissionsForRoles } from 'src/engine/permissions/role/utils/compute-objects-permissions-for-roles.util';

const objectsPermissionsByMetadataMapsByPrincipals = new WeakMap<
  PermissionsPrincipalsWithRolesContext,
  WeakMap<PermissionsMetadataMaps, ObjectsPermissions>
>();

export const getPermissionsPrincipalsObjectsPermissions = ({
  principals,
  metadataMaps,
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  metadataMaps: PermissionsMetadataMaps;
}): ObjectsPermissions => {
  const objectsPermissionsByMetadataMaps =
    objectsPermissionsByMetadataMapsByPrincipals.get(principals) ??
    new WeakMap<PermissionsMetadataMaps, ObjectsPermissions>();

  objectsPermissionsByMetadataMapsByPrincipals.set(
    principals,
    objectsPermissionsByMetadataMaps,
  );

  const cachedObjectsPermissions =
    objectsPermissionsByMetadataMaps.get(metadataMaps);

  if (isDefined(cachedObjectsPermissions)) {
    return cachedObjectsPermissions;
  }

  const objectsPermissions = computeObjectsPermissionsForRoles({
    principals,
    rolesPermissions: metadataMaps.rolesPermissions,
    flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    flatApplicationMaps: metadataMaps.flatApplicationMaps,
  });

  objectsPermissionsByMetadataMaps.set(metadataMaps, objectsPermissions);

  return objectsPermissions;
};
