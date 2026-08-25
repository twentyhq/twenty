import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { type CacheEntityFetchShape } from 'src/engine/workspace-cache/types/cache-entity-fetch-shape.type';

@Injectable()
@WorkspaceCache('apiKeyRoleMap', { packingPonderation: 1 })
export class WorkspaceApiKeyRoleMapCacheService extends WorkspaceCacheProvider<
  Record<string, string>
> {
  override readonly fetchRequirements = {
    roleTarget: true,
  } as const satisfies CacheEntityFetchShape;

  computeForCache(
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): Record<string, string> {
    const { roleTarget: roleTargets } = recomputeContext.getRowsByName(
      this.fetchRequirements,
    );

    // the recompute context only filters on workspaceId: the previous
    // apiKeyId IS NOT NULL condition moved in memory
    const roleTargetsMap = roleTargets.filter((roleTarget) =>
      isDefined(roleTarget.apiKeyId),
    );

    return roleTargetsMap.reduce(
      (acc, roleTarget) => {
        if (roleTarget.apiKeyId) {
          acc[roleTarget.apiKeyId] = roleTarget.roleId;
        }

        return acc;
      },
      {} as Record<string, string>,
    );
  }
}
