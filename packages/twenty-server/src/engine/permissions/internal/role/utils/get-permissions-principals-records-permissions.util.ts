/* @license Enterprise */

import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { computePrincipalsRecordsPermissions } from 'src/engine/permissions/internal/role/utils/compute-principals-records-permissions.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const getPermissionsPrincipalsRecordsPermissions = ({
  principals,
  metadataMaps,
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  metadataMaps: PermissionsMetadataMaps;
}): RoleRecordsPermissions =>
  computePrincipalsRecordsPermissions({
    principals,
    rolesPermissions: metadataMaps.rolesPermissions,
    flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    flatApplicationMaps: metadataMaps.flatApplicationMaps,
  });
