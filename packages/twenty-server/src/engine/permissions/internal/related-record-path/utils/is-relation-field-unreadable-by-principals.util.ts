/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { getPermissionsPrincipalsLimitingRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-limiting-role-ids.util';
import { getPermissionsPrincipalsMainRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-main-role-ids.util';

export const isRelationFieldUnreadableByPrincipals = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
  relationFieldMetadataId,
}: Pick<
  PermissionsObjectAccessRequest,
  'principals' | 'metadataMaps' | 'flatObjectMetadata'
> & {
  relationFieldMetadataId: string;
}): boolean =>
  [
    ...getPermissionsPrincipalsMainRoleIds(principals),
    ...getPermissionsPrincipalsLimitingRoleIds(principals),
  ].some(
    (roleId) =>
      metadataMaps.rolesPermissions[roleId]?.objects[
        flatObjectMetadata.id
      ]?.unreadableFields.includes(relationFieldMetadataId) ?? false,
  );
