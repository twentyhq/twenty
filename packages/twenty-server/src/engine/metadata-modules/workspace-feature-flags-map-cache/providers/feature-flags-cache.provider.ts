import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { WorkspaceContextCache } from 'src/engine/workspace-context-cache/decorators/workspace-context-cache.decorator';
import { WorkspaceContextCacheProvider } from 'src/engine/workspace-context-cache/workspace-context-cache-provider.service';

@Injectable()
@WorkspaceContextCache('featureFlagsMap')
export class FeatureFlagsCacheProvider extends WorkspaceContextCacheProvider<FeatureFlagMap> {
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

  dataCacheKey(workspaceId: string): string {
    return `feature-flag:feature-flag-map:${workspaceId}`;
  }

  hashCacheKey(workspaceId: string): string {
    return `feature-flag:feature-flag-map-version:${workspaceId}`;
  }
}
