import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { WORKFLOW_RUN_QUEUE_THROTTLE_LIMIT } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/workflow-run-queue-throttle-limit';
import { getWorkflowRunQueuedCountCacheKey } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-cache-workflow-run-count-key.util';

@Injectable()
export class WorkflowRunQueueWorkspaceService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleWorkflow)
    private readonly cacheStorage: CacheStorageService,
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

  async setWorkflowRunQueuedCount(
    workspaceId: string,
    count: number,
  ): Promise<void> {
    await this.cacheStorage.set(
      getWorkflowRunQueuedCountCacheKey(workspaceId),
      count,
    );
  }

  async getRemainingRunsToEnqueueCount(workspaceId: string): Promise<number> {
    const currentCount =
      await this.getCurrentWorkflowRunQueuedCount(workspaceId);

    return WORKFLOW_RUN_QUEUE_THROTTLE_LIMIT - currentCount;
  }

  private async getCurrentWorkflowRunQueuedCount(
    workspaceId: string,
  ): Promise<number> {
    const key = getWorkflowRunQueuedCountCacheKey(workspaceId);

    const currentCount = (await this.cacheStorage.get<number>(key)) ?? 0;

    return Math.max(0, currentCount);
  }
}
