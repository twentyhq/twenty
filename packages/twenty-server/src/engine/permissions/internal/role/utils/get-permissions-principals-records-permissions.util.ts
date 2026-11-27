/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { computePrincipalsRecordsPermissions } from 'src/engine/permissions/internal/role/utils/compute-principals-records-permissions.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

type RecordsPermissionsMetadataMaps = Pick<
  PermissionsMetadataMaps,
  | 'rolesPermissions'
  | 'flatObjectMetadataMaps'
  | 'flatFieldMetadataMaps'
  | 'temporaryChannelWriteAccess'
>;

type ComputedRecordsPermissions = {
  metadataMaps: RecordsPermissionsMetadataMaps;
  recordsPermissions: RoleRecordsPermissions;
};

const computedRecordsPermissionsByPrincipals = new WeakMap<
  PermissionsPrincipalsWithRolesContext,
  ComputedRecordsPermissions
>();

const isComputedFromSameMetadataMaps = (
  computedMetadataMaps: RecordsPermissionsMetadataMaps,
  metadataMaps: RecordsPermissionsMetadataMaps,
): boolean =>
  computedMetadataMaps.rolesPermissions === metadataMaps.rolesPermissions &&
  computedMetadataMaps.flatObjectMetadataMaps ===
    metadataMaps.flatObjectMetadataMaps &&
  computedMetadataMaps.flatFieldMetadataMaps ===
    metadataMaps.flatFieldMetadataMaps &&
  computedMetadataMaps.temporaryChannelWriteAccess ===
    metadataMaps.temporaryChannelWriteAccess;

export const getPermissionsPrincipalsRecordsPermissions = ({
  principals,
  metadataMaps,
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  metadataMaps: RecordsPermissionsMetadataMaps;
}): RoleRecordsPermissions => {
  const computedRecordsPermissions =
    computedRecordsPermissionsByPrincipals.get(principals);

  if (
    isDefined(computedRecordsPermissions) &&
    isComputedFromSameMetadataMaps(
      computedRecordsPermissions.metadataMaps,
      metadataMaps,
    )
  ) {
    return computedRecordsPermissions.recordsPermissions;
  }

  const recordsPermissions = computePrincipalsRecordsPermissions({
    principals,
    rolesPermissions: metadataMaps.rolesPermissions,
    flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    // TODO(@charlesBochet): remove after 2026-12-27. Temporary channel write access for admins and API keys, only to unblock customers who reported broken links, merges and deletes
    temporaryChannelWriteAccess: metadataMaps.temporaryChannelWriteAccess,
  });

  computedRecordsPermissionsByPrincipals.set(principals, {
    metadataMaps,
    recordsPermissions,
  });

  return recordsPermissions;
};
