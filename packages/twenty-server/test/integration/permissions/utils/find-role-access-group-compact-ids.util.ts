import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AccessGroupReadService } from 'src/engine/permissions/internal/access-group/services/access-group-read.service';
import { buildRolePermissionsPrincipals } from 'src/engine/permissions/internal/principal/utils/build-role-permissions-principals.util';

export const findRoleAccessGroupCompactIds = ({
  workspaceId,
  roleId,
  objectMetadataId,
}: {
  workspaceId: string;
  roleId: string;
  objectMetadataId: string;
}): Promise<number[]> =>
  getAppProviderByClassName<AccessGroupReadService>(
    'AccessGroupReadService',
  ).findPrincipalsAccessGroupCompactIds({
    principals: buildRolePermissionsPrincipals({
      workspaceId,
      roleIds: [roleId],
    }),
    objectMetadataId,
    operationType: 'read',
  });
