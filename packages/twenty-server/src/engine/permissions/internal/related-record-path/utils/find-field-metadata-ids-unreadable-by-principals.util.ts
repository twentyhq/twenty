/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { getPermissionsPrincipalsRecordsPermissions } from 'src/engine/permissions/internal/role/utils/get-permissions-principals-records-permissions.util';

export const findFieldMetadataIdsUnreadableByPrincipals = ({
  principals,
  metadataMaps,
}: Pick<
  PermissionsObjectAccessRequest,
  'principals' | 'metadataMaps'
>): Set<string> =>
  new Set(
    Object.values(
      getPermissionsPrincipalsRecordsPermissions({ principals, metadataMaps })
        .objects,
    ).flatMap(
      (objectRecordsPermissions) =>
        objectRecordsPermissions?.unreadableFields ?? [],
    ),
  );
