import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';

@Injectable()
@WorkspaceCache('featureFlagsMap')
export class WorkspaceFeatureFlagsMapCacheService extends WorkspaceCacheProvider<FeatureFlagMap> {
  constructor(
    @InjectWorkspaceScopedRepository(FeatureFlagEntity)
    private readonly featureFlagRepository: WorkspaceScopedRepository<FeatureFlagEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FeatureFlagMap> {
    const workspaceFeatureFlags =
      await this.featureFlagRepository.find(workspaceId);

    return workspaceFeatureFlags.reduce((result, currentFeatureFlag) => {
      result[currentFeatureFlag.key] = currentFeatureFlag.value;

      return result;
    }, {} as FeatureFlagMap);
  }
}
