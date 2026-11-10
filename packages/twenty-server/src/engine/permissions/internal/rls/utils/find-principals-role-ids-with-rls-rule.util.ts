/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-role-ids.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const findPrincipalsRoleIdsWithRlsRule = ({
  principals,
  metadataMaps,
  objectMetadataId,
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  metadataMaps: Pick<PermissionsMetadataMaps, 'rolesPermissions'>;
  objectMetadataId: string;
}): string[] =>
  getPermissionsPrincipalsRoleIds(principals).filter((roleId) =>
    isDefined(
      metadataMaps.rolesPermissions[roleId]?.objects[objectMetadataId]
        ?.rowLevelRecordsPermissions,
    ),
  );
