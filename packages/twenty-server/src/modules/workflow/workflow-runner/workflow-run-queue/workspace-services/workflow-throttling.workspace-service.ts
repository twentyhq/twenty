import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { getWorkflowRunNotStartedCountCacheKey } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-workflow-run-not-started-count-cache-key.util';

@Injectable()
export class WorkflowThrottlingWorkspaceService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleWorkflow)
    private readonly cacheStorage: CacheStorageService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly throttlerService: ThrottlerService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async getRemainingRunsToEnqueueCount(workspaceId: string) {
    return this.throttlerService.getAvailableTokensCount(
      `${workspaceId}-workflow-execution-soft-throttle`,
      this.twentyConfigService.get('WORKFLOW_EXEC_SOFT_THROTTLE_LIMIT'),
      this.twentyConfigService.get('WORKFLOW_EXEC_SOFT_THROTTLE_TTL'),
    );
  }

  async consumeRemainingRunsToEnqueueCount(
    workspaceId: string,
    runsToConsume: number,
  ) {
    await this.throttlerService.consumeTokens(
      `${workspaceId}-workflow-execution-soft-throttle`,
      runsToConsume,
      this.twentyConfigService.get('WORKFLOW_EXEC_SOFT_THROTTLE_LIMIT'),
      this.twentyConfigService.get('WORKFLOW_EXEC_SOFT_THROTTLE_TTL'),
    );
  }

  async throttleOrThrowIfHardLimitReached(workspaceId: string) {
    await this.throttlerService.tokenBucketThrottleOrThrow(
      `${workspaceId}-workflow-execution-hard-throttle`,
      1,
      this.twentyConfigService.get('WORKFLOW_EXEC_HARD_THROTTLE_LIMIT'),
      this.twentyConfigService.get('WORKFLOW_EXEC_HARD_THROTTLE_TTL'),
    );
  }

  async increaseWorkflowRunNotStartedCount(
    workspaceId: string,
    newlyEnqueuedCount = 1,
  ): Promise<void> {
    const currentCount =
      await this.getCurrentWorkflowRunNotStartedCount(workspaceId);

    await this.cacheStorage.set(
      getWorkflowRunNotStartedCountCacheKey(workspaceId),
      currentCount + newlyEnqueuedCount,
    );
  }

  async decreaseWorkflowRunNotStartedCount(
    workspaceId: string,
    removedFromQueueCount = 1,
  ): Promise<void> {
    const currentCount =
      await this.getCurrentWorkflowRunNotStartedCount(workspaceId);

    await this.cacheStorage.set(
      getWorkflowRunNotStartedCountCacheKey(workspaceId),
      currentCount - removedFromQueueCount,
    );
  }

  async recomputeWorkflowRunNotStartedCount(
    workspaceId: string,
  ): Promise<void> {
    const workflowRunRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        WorkflowRunWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

    const currentlyNotStartedWorkflowRunCount =
      await workflowRunRepository.count({
        where: {
          status: In([WorkflowRunStatus.NOT_STARTED]),
        },
      });

    await this.setWorkflowRunNotStartedCount(
      workspaceId,
      currentlyNotStartedWorkflowRunCount,
    );
  }

  async getNotStartedRunsCountFromCache(workspaceId: string): Promise<number> {
    return this.getCurrentWorkflowRunNotStartedCount(workspaceId);
  }

  async getNotStartedRunsCountFromDatabase(
    workspaceId: string,
  ): Promise<number> {
    const workflowRunRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        WorkflowRunWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

    return workflowRunRepository.count({
      where: {
        status: In([WorkflowRunStatus.NOT_STARTED]),
      },
    });
  }

  private async setWorkflowRunNotStartedCount(
    workspaceId: string,
    count: number,
  ): Promise<void> {
    await this.cacheStorage.set(
      getWorkflowRunNotStartedCountCacheKey(workspaceId),
      count,
    );
  }

  private async getCurrentWorkflowRunNotStartedCount(
    workspaceId: string,
  ): Promise<number> {
    const key = getWorkflowRunNotStartedCountCacheKey(workspaceId);

    const currentCount = (await this.cacheStorage.get<number>(key)) ?? 0;

    return Math.max(0, currentCount);
  }
}
