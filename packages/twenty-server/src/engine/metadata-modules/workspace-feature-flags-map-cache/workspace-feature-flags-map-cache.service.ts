import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';

@Injectable()
@WorkspaceCache('featureFlagsMap')
export class WorkspaceFeatureFlagsMapCacheService extends WorkspaceCacheProvider<FeatureFlagMap> {
  constructor(
    @InjectRepository(FeatureFlagEntity)
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FeatureFlagMap> {
    const workspaceFeatureFlags = await this.featureFlagRepository.find({
      where: { workspaceId },
    });

    const workspaceFeatureFlagsMap = workspaceFeatureFlags.reduce(
      (result, currentFeatureFlag) => {
        result[currentFeatureFlag.key] = currentFeatureFlag.value;

        return result;
      },
      {} as FeatureFlagMap,
    );

    return workspaceFeatureFlagsMap;
  }
}
