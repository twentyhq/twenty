import { Injectable, Logger } from '@nestjs/common';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class WorkspaceFeatureFlagMapCacheService {
  logger = new Logger(WorkspaceFeatureFlagMapCacheService.name);

  constructor(
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async recomputeFeatureFlagMapCache({
    workspaceId,
    ignoreLock = false,
  }: {
    workspaceId: string;
    ignoreLock?: boolean;
  }): Promise<void> {
    const isAlreadyCaching =
      await this.workspaceCacheStorageService.getFeatureFlagMapOngoingCachingLock(
        workspaceId,
      );

    if (!ignoreLock && isAlreadyCaching) {
      return;
    }

    await this.workspaceCacheStorageService.addFeatureFlagMapOngoingCachingLock(
      workspaceId,
    );

    const freshFeatureFlagMap =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(workspaceId);

    await this.workspaceCacheStorageService.setFeatureFlagMap(
      workspaceId,
      freshFeatureFlagMap,
    );

    await this.workspaceCacheStorageService.removeFeatureFlagMapOngoingCachingLock(
      workspaceId,
    );
  }
}
