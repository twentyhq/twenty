import { Injectable } from '@nestjs/common';

import { WorkspaceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-derived-cache-provider.service';

import { computeApiKeyRoleMap } from 'src/engine/metadata-modules/role-target/utils/compute-api-key-role-map.util';
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
    return computeApiKeyRoleMap({ flatRoleTargetMaps });
  }
}
