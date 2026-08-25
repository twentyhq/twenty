import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { type CacheEntityFetchShape } from 'src/engine/workspace-cache/types/cache-entity-fetch-shape.type';

@Injectable()
@WorkspaceCache('featureFlagsMap', { packingPonderation: 1 })
export class WorkspaceFeatureFlagsMapCacheService extends WorkspaceCacheProvider<FeatureFlagMap> {
  override readonly fetchRequirements = {
    featureFlag: true,
  } as const satisfies CacheEntityFetchShape;

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FeatureFlagMap {
    const { featureFlag: workspaceFeatureFlags } =
      recomputeContext.getRowsByName(this.fetchRequirements);

    return workspaceFeatureFlags.reduce((result, currentFeatureFlag) => {
      result[currentFeatureFlag.key] = currentFeatureFlag.value;

      return result;
    }, {} as FeatureFlagMap);
  }
}
