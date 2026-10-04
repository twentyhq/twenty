import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-derived-cache-provider.service';

import { WorkspaceDerivedCache } from 'src/engine/workspace-cache/decorators/workspace-derived-cache.decorator';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

@Injectable()
@WorkspaceDerivedCache('apiKeyRoleMap', { maxMemoizedWorkspaces: 1_000 })
export class WorkspaceApiKeyRoleMapCacheService extends WorkspaceDerivedCacheProvider<
  'apiKeyRoleMap',
  'flatRoleTargetMaps'
> {
  readonly sourceKeyNames = ['flatRoleTargetMaps'] as const;

  computeFromSources({
    flatRoleTargetMaps,
  }: Pick<WorkspaceCacheDataMap, 'flatRoleTargetMaps'>): Record<
    string,
    string
  > {
    const apiKeyRoleMap: Record<string, string> = {};

    for (const flatRoleTarget of Object.values(
      flatRoleTargetMaps.byUniversalIdentifier,
    )) {
      if (isDefined(flatRoleTarget?.apiKeyId)) {
        apiKeyRoleMap[flatRoleTarget.apiKeyId] = flatRoleTarget.roleId;
      }
    }

    return apiKeyRoleMap;
  }
}
