import { Injectable } from '@nestjs/common';

import { IsNull } from 'typeorm';

import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { buildRolesPermissions } from 'src/engine/metadata-modules/role/utils/build-roles-permissions.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

const ROLES_PERMISSIONS_ROWS_REQUIREMENT = {
  role: true,
  objectPermission: { columns: true, groupBy: ['roleId'] },
  rolePermissionFlag: { columns: true, groupBy: ['roleId'] },
  permissionFlag: true,
  fieldPermission: { columns: true, groupBy: ['roleId'] },
  rowLevelPermissionPredicate: {
    columns: true,
    groupBy: ['roleId'],
    where: { deletedAt: IsNull() },
  },
  rowLevelPermissionPredicateGroup: {
    columns: true,
    groupBy: ['roleId'],
    where: { deletedAt: IsNull() },
  },
  objectMetadata: [
    'id',
    'isSystem',
    'universalIdentifier',
    'labelIdentifierFieldMetadataId',
  ],
} as const satisfies WorkspaceCacheRowsRequirement;

@Injectable()
@WorkspaceCache('rolesPermissions', { packingPonderation: 2 })
export class WorkspaceRolesPermissionsCacheService extends WorkspaceCacheProvider<ObjectsPermissionsByRoleId> {
  override readonly rowsRequirement = ROLES_PERMISSIONS_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof ROLES_PERMISSIONS_ROWS_REQUIREMENT
  >): ObjectsPermissionsByRoleId {
    return buildRolesPermissions(rows);
  }
}
