/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { computePrincipalsRecordsPermissions } from 'src/engine/permissions/role/utils/compute-principals-records-permissions.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const recordsPermissionsByMetadataMapsByPrincipals = new WeakMap<
  PermissionsPrincipalsWithRolesContext,
  WeakMap<PermissionsMetadataMaps, RoleRecordsPermissions>
>();

export const getPermissionsPrincipalsRecordsPermissions = ({
  principals,
  metadataMaps,
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  metadataMaps: PermissionsMetadataMaps;
}): RoleRecordsPermissions => {
  const recordsPermissionsByMetadataMaps =
    recordsPermissionsByMetadataMapsByPrincipals.get(principals) ??
    new WeakMap<PermissionsMetadataMaps, RoleRecordsPermissions>();

  recordsPermissionsByMetadataMapsByPrincipals.set(
    principals,
    recordsPermissionsByMetadataMaps,
  );

  const cachedRecordsPermissions =
    recordsPermissionsByMetadataMaps.get(metadataMaps);

  if (isDefined(cachedRecordsPermissions)) {
    return cachedRecordsPermissions;
  }

  const recordsPermissions = computePrincipalsRecordsPermissions({
    principals,
    rolesRecordsPermissions: metadataMaps.rolesRecordsPermissions,
    flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    flatApplicationMaps: metadataMaps.flatApplicationMaps,
  });

  recordsPermissionsByMetadataMaps.set(metadataMaps, recordsPermissions);

  return recordsPermissions;
};
