import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { getWorkflowRunQueuedCountCacheKey } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-cache-workflow-run-count-key.util';

@Injectable()
export class WorkflowRunQueueWorkspaceService {
  private readonly WORKFLOW_RUN_QUEUE_THROTTLE_LIMIT = 100;

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleWorkflow)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  async increaseWorkflowRunQueuedCount(
    workspaceId: string,
    newlyEnqueuedCount = 1,
  ): Promise<void> {
    const key = getWorkflowRunQueuedCountCacheKey(workspaceId);

    const currentCount = (await this.cacheStorage.get<number>(key)) ?? 0;

    await this.cacheStorage.set(key, currentCount + newlyEnqueuedCount);
  }

  async decreaseWorkflowRunQueuedCount(
    workspaceId: string,
    decrementedCount = 1,
  ): Promise<void> {
    const key = getWorkflowRunQueuedCountCacheKey(workspaceId);

    const currentCount = (await this.cacheStorage.get<number>(key)) ?? 0;

    await this.cacheStorage.set(key, currentCount - decrementedCount);
  }

  async getRemainingRunsToEnqueueCount(workspaceId: string): Promise<number> {
    const key = getWorkflowRunQueuedCountCacheKey(workspaceId);

    const currentCount = (await this.cacheStorage.get<number>(key)) ?? 0;

    return this.WORKFLOW_RUN_QUEUE_THROTTLE_LIMIT - currentCount;
  }
}
