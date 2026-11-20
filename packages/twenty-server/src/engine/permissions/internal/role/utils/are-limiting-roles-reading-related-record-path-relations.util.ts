/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { getPermissionsPrincipalsLimitingRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-limiting-role-ids.util';
import { resolveRelatedRecordPaths } from 'src/engine/permissions/internal/related-record-path/utils/resolve-related-record-paths.util';

export const areLimitingRolesReadingRelatedRecordPathRelations = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
}: Pick<
  PermissionsObjectAccessRequest,
  'principals' | 'metadataMaps' | 'flatObjectMetadata'
>): boolean => {
  const limitingUnreadableFieldMetadataIds = new Set([
    ...getPermissionsPrincipalsLimitingRoleIds(principals).flatMap(
      (limitingRoleId) =>
        metadataMaps.rolesPermissions[limitingRoleId]?.objects[
          flatObjectMetadata.id
        ]?.unreadableFields ?? [],
    ),
    ...(isDefined(principals.runtimeLimitingRole)
      ? (principals.runtimeLimitingRole.recordsPermissions.objects[
          flatObjectMetadata.id
        ]?.unreadableFields ?? [])
      : []),
  ]);

  if (limitingUnreadableFieldMetadataIds.size === 0) {
    return true;
  }

  return resolveRelatedRecordPaths(metadataMaps)
    .filter(
      ({ sourceFlatObjectMetadata }) =>
        sourceFlatObjectMetadata.id === flatObjectMetadata.id,
    )
    .every(
      ({ hops }) =>
        !limitingUnreadableFieldMetadataIds.has(
          hops[0].relationFieldMetadataId,
        ),
    );
};
