import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

const USER_WORKSPACE_ROLE_ROWS_REQUIREMENT = {
  roleTarget: true,
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

    // the recompute context only filters on workspaceId: the previous
    // userWorkspaceId IS NOT NULL condition moved in memory
    const roleTargetsMap = roleTargets.filter((roleTarget) =>
      isDefined(roleTarget.userWorkspaceId),
    );

    return roleTargetsMap.reduce((acc, roleTarget) => {
      if (isDefined(roleTarget.userWorkspaceId)) {
        acc[roleTarget.userWorkspaceId] = roleTarget.roleId;
      }

      return acc;
    }, {} as UserWorkspaceRoleMap);
  }
}
