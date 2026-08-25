import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { entityFetchRequirement } from 'src/engine/workspace-cache/utils/entity-fetch-requirement.util';

@Injectable()
@WorkspaceCache('userWorkspaceRoleMap', { packingPonderation: 1 })
export class WorkspaceUserWorkspaceRoleMapCacheService extends WorkspaceCacheProvider<UserWorkspaceRoleMap> {
  override readonly fetchRequirements = [
    entityFetchRequirement(RoleTargetEntity),
  ];

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): UserWorkspaceRoleMap {
    const roleTargets = recomputeContext.getRows(RoleTargetEntity);

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
