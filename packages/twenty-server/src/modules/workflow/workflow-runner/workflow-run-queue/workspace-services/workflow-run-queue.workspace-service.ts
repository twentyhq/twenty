import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { DEFAULT_WORKFLOW_RUN_QUEUE_THROTTLE_LIMIT } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/default-workflow-run-queue-throttle-limit';
import { getWorkflowRunQueuedCountCacheKey } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-cache-workflow-run-count-key.util';
import { getWorkflowRunQueueThrottleLimitKey } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-cache-workflow-run-queue-throttle-limit-key.util';

@Injectable()
export class WorkflowRunQueueWorkspaceService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleWorkflow)
    private readonly cacheStorage: CacheStorageService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async increaseWorkflowRunQueuedCount(
    workspaceId: string,
    newlyEnqueuedCount = 1,
  ): Promise<void> {
    const currentCount =
      await this.getCurrentWorkflowRunQueuedCount(workspaceId);

    await this.cacheStorage.set(
      getWorkflowRunQueuedCountCacheKey(workspaceId),
      currentCount + newlyEnqueuedCount,
    );
  }

  async decreaseWorkflowRunQueuedCount(
    workspaceId: string,
    removedFromQueueCount = 1,
  ): Promise<void> {
    const currentCount =
      await this.getCurrentWorkflowRunQueuedCount(workspaceId);

    await this.cacheStorage.set(
      getWorkflowRunQueuedCountCacheKey(workspaceId),
      currentCount - removedFromQueueCount,
    );
  }

  async recomputeWorkflowRunQueuedCount(workspaceId: string): Promise<void> {
    const workflowRunRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        WorkflowRunWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

    const currentlyEnqueuedWorkflowRunCount = await workflowRunRepository.count(
      {
        where: {
          status: In([WorkflowRunStatus.ENQUEUED, WorkflowRunStatus.RUNNING]),
        },
      },
    );

    await this.setWorkflowRunQueuedCount(
      workspaceId,
      currentlyEnqueuedWorkflowRunCount,
    );
  }

  async getRemainingRunsToEnqueueCountFromCache(
    workspaceId: string,
  ): Promise<number> {
    const currentCount =
      await this.getCurrentWorkflowRunQueuedCount(workspaceId);
    const throttleLimit =
      await this.getWorkflowRunQueueThrottleLimit(workspaceId);

    return throttleLimit - currentCount;
  }

  async getRemainingRunsToEnqueueCountFromDatabase(
    workspaceId: string,
  ): Promise<number> {
    const workflowRunRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        WorkflowRunWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

    const currentCount = await workflowRunRepository.count({
      where: {
        status: In([WorkflowRunStatus.ENQUEUED, WorkflowRunStatus.RUNNING]),
      },
    });

    const throttleLimit =
      await this.getWorkflowRunQueueThrottleLimit(workspaceId);

    return throttleLimit - currentCount;
  }

  private async setWorkflowRunQueuedCount(
    workspaceId: string,
    count: number,
  ): Promise<void> {
    await this.cacheStorage.set(
      getWorkflowRunQueuedCountCacheKey(workspaceId),
      count,
    );
  }

  private async getCurrentWorkflowRunQueuedCount(
    workspaceId: string,
  ): Promise<number> {
    const key = getWorkflowRunQueuedCountCacheKey(workspaceId);

    const currentCount = (await this.cacheStorage.get<number>(key)) ?? 0;

    return Math.max(0, currentCount);
  }

  private async getWorkflowRunQueueThrottleLimit(
    workspaceId: string,
  ): Promise<number> {
    const key = getWorkflowRunQueueThrottleLimitKey(workspaceId);

    const throttleLimit = (await this.cacheStorage.get<number>(key)) ?? 0;

    return Math.max(DEFAULT_WORKFLOW_RUN_QUEUE_THROTTLE_LIMIT, throttleLimit);
  }
}
