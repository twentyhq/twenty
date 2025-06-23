import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { TwentyORMExceptionCode } from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { getFromCacheWithRecompute } from 'src/engine/utils/get-data-from-cache-with-recompute.util';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

const FEATURE_FLAG_MAP = 'Feature flag map';

@Injectable()
export class WorkspaceFeatureFlagsMapCacheService {
  logger = new Logger(WorkspaceFeatureFlagsMapCacheService.name);

  constructor(
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    @InjectRepository(FeatureFlag, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlag>,
  ) {}

  async getWorkspaceFeatureFlagsMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FeatureFlagMap> {
    const { data: workspaceFeatureFlagsMap } =
      await this.getWorkspaceFeatureFlagsMapAndVersion({ workspaceId });

    return workspaceFeatureFlagsMap;
  }

  async getWorkspaceFeatureFlagsMapAndVersion({
    workspaceId,
  }: {
    workspaceId: string;
  }) {
    return getFromCacheWithRecompute<string, FeatureFlagMap>({
      workspaceId,
      getCacheData: () =>
        this.workspaceCacheStorageService.getFeatureFlagsMap(workspaceId),
      getCacheVersion: () =>
        this.workspaceCacheStorageService.getFeatureFlagsMapVersionFromCache(
          workspaceId,
        ),
      recomputeCache: (params) => this.recomputeFeatureFlagsMapCache(params),
      cachedEntityName: FEATURE_FLAG_MAP,
      exceptionCode: TwentyORMExceptionCode.FEATURE_FLAG_MAP_VERSION_NOT_FOUND,
      logger: this.logger,
    });
  }

  async recomputeFeatureFlagsMapCache({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<void> {
    const freshFeatureFlagMap =
      await this.getFeatureFlagsMapFromDatabase(workspaceId);

    await this.workspaceCacheStorageService.setFeatureFlagsMap(
      workspaceId,
      freshFeatureFlagMap,
    );
  }

  private async getFeatureFlagsMapFromDatabase(workspaceId: string) {
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
