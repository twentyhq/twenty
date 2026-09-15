import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

const FEATURE_FLAGS_ROWS_REQUIREMENT = {
  featureFlag: true,
} as const satisfies WorkspaceCacheRowsRequirement;

@Injectable()
@WorkspaceCache('featureFlagsMap', { packingPonderation: 1 })
export class WorkspaceFeatureFlagsMapCacheService extends WorkspaceCacheProvider<FeatureFlagMap> {
  override readonly rowsRequirement = FEATURE_FLAGS_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FEATURE_FLAGS_ROWS_REQUIREMENT
  >): FeatureFlagMap {
    const { featureFlag: workspaceFeatureFlags } = rows;

    return workspaceFeatureFlags.reduce((result, currentFeatureFlag) => {
      result[currentFeatureFlag.key] = currentFeatureFlag.value;

      return result;
    }, {} as FeatureFlagMap);
  }
}
