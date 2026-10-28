import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { IN_PROCESS_WORKSPACE_MIGRATION_ACTIONS_MARKER_TTL_MS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/in-process-workspace-migration-actions-marker-ttl-ms.constant';

@Injectable()
export class InProcessWorkspaceMigrationActionsService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineLock)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async runWithActionsInProcess<TResult>({
    workspaceId,
    callback,
  }: {
    workspaceId: string;
    callback: () => Promise<TResult>;
  }): Promise<TResult> {
    const key = this.getKey(workspaceId);

    await this.cacheStorageService.set(
      key,
      true,
      IN_PROCESS_WORKSPACE_MIGRATION_ACTIONS_MARKER_TTL_MS,
    );

    try {
      return await callback();
    } finally {
      await this.cacheStorageService.del(key);
    }
  }

  async isRunningActionsInProcess(workspaceId: string): Promise<boolean> {
    return isDefined(
      await this.cacheStorageService.get<boolean>(this.getKey(workspaceId)),
    );
  }

  private getKey(workspaceId: string): string {
    return `workspace-migration-actions-in-process:${workspaceId}`;
  }
}
