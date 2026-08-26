import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type CacheEntityFetchShape } from 'src/engine/workspace-cache/types/cache-entity-fetch-shape.type';

const API_KEY_ROLE_ROWS_REQUIREMENT = {
  roleTarget: true,
} as const satisfies CacheEntityFetchShape;

@Injectable()
@WorkspaceCache('apiKeyRoleMap', { packingPonderation: 1 })
export class WorkspaceApiKeyRoleMapCacheService extends WorkspaceCacheProvider<
  Record<string, string>
> {
  override readonly rowsRequirement = API_KEY_ROLE_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof API_KEY_ROLE_ROWS_REQUIREMENT
  >): Record<string, string> {
    const { roleTarget: roleTargets } = rows;

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
