/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { getPermissionsPrincipalsLimitingRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-limiting-role-ids.util';
import { isFieldUnreadableByRole } from 'src/engine/permissions/internal/related-record-path/utils/is-field-unreadable-by-role.util';
import { resolveRelatedRecordPaths } from 'src/engine/permissions/internal/related-record-path/utils/resolve-related-record-paths.util';

export const areLimitingRolesReadingRelatedRecordPathRelations = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
}: Pick<
  PermissionsObjectAccessRequest,
  'principals' | 'metadataMaps' | 'flatObjectMetadata'
>): boolean => {
  const limitingRolesRecordsPermissions = [
    ...getPermissionsPrincipalsLimitingRoleIds(principals)
      .map((limitingRoleId) => metadataMaps.rolesPermissions[limitingRoleId])
      .filter(isDefined),
    ...(isDefined(principals.runtimeLimitingRole)
      ? [principals.runtimeLimitingRole.recordsPermissions]
      : []),
  ];

  if (limitingRolesRecordsPermissions.length === 0) {
    return true;
  }

  return resolveRelatedRecordPaths(metadataMaps)
    .filter(
      ({ sourceFlatObjectMetadata }) =>
        sourceFlatObjectMetadata.id === flatObjectMetadata.id,
    )
    .every(({ hops }) =>
      limitingRolesRecordsPermissions.every(
        (roleRecordsPermissions) =>
          !isFieldUnreadableByRole({
            roleRecordsPermissions,
            objectMetadataId: flatObjectMetadata.id,
            fieldMetadataId: hops[0].relationFieldMetadataId,
          }),
      ),
    );
};
