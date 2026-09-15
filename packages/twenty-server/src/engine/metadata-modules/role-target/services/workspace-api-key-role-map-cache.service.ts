import { Injectable } from '@nestjs/common';

import { IsNull, Not } from 'typeorm';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

const API_KEY_ROLE_ROWS_REQUIREMENT = {
  roleTarget: {
    columns: ['apiKeyId', 'roleId'],
    where: { apiKeyId: Not(IsNull()) },
  },
} as const satisfies WorkspaceCacheRowsRequirement;

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

    return roleTargets.reduce(
      (acc, { apiKeyId, roleId }) => {
        if (isDefined(apiKeyId)) {
          acc[apiKeyId] = roleId;
        }

        return acc;
      },
      {} as Record<string, string>,
    );
  }
}
