import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';

@Injectable()
@WorkspaceCache('featureFlagsMap', { packingPonderation: 1 })
export class WorkspaceFeatureFlagsMapCacheService extends WorkspaceCacheProvider<FeatureFlagMap> {
  async computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): Promise<FeatureFlagMap> {
    const workspaceFeatureFlags =
      await recomputeContext.findAll(FeatureFlagEntity);

    return workspaceFeatureFlags.reduce((result, currentFeatureFlag) => {
      result[currentFeatureFlag.key] = currentFeatureFlag.value;

      return result;
    }, {} as FeatureFlagMap);
  }
}
