/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const isMainRoleRestrictedByRlsRule = ({
  principals,
  metadataMaps,
  objectMetadataId,
}: {
  principals: Pick<PermissionsPrincipalsWithRolesContext, 'mainPrincipal'>;
  metadataMaps: Pick<PermissionsMetadataMaps, 'rolesPermissions'>;
  objectMetadataId: string;
}): boolean =>
  isDefined(
    metadataMaps.rolesPermissions[principals.mainPrincipal.roleId]?.objects[
      objectMetadataId
    ]?.rowLevelRecordsPermissions,
  );
