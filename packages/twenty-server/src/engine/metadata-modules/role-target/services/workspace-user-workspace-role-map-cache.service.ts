import { Injectable } from '@nestjs/common';

import { IsNull, Not } from 'typeorm';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

const USER_WORKSPACE_ROLE_ROWS_REQUIREMENT = {
  roleTarget: {
    columns: ['userWorkspaceId', 'roleId'],
    where: { userWorkspaceId: Not(IsNull()) },
  },
} as const satisfies WorkspaceCacheRowsRequirement;

@Injectable()
@WorkspaceCache('userWorkspaceRoleMap', { packingPonderation: 1 })
export class WorkspaceUserWorkspaceRoleMapCacheService extends WorkspaceCacheProvider<UserWorkspaceRoleMap> {
  override readonly rowsRequirement = USER_WORKSPACE_ROLE_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof USER_WORKSPACE_ROLE_ROWS_REQUIREMENT
  >): UserWorkspaceRoleMap {
    const { roleTarget: roleTargets } = rows;

    return roleTargets.reduce((acc, { userWorkspaceId, roleId }) => {
      if (isDefined(userWorkspaceId)) {
        acc[userWorkspaceId] = roleId;
      }

      return acc;
    }, {} as UserWorkspaceRoleMap);
  }
}
