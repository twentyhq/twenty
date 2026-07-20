import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { FIND_ALL_VIEWS_CACHE_DEPENDENCY_KEYS } from 'src/engine/workspace-cache-storage/constants/find-all-views-cache-dependency-keys.constant';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const MAX_LOCAL_GENERATIONS = 6_000;

@Injectable()
export class FindAllViewsCacheService {
  private readonly localGenerationByWorkspaceId = new Map<string, string>();
  private readonly synchronizationByWorkspaceId = new Map<
    string,
    Promise<void>
  >();

  constructor(
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async getCacheGeneration(workspaceId: string): Promise<string | undefined> {
    const generation =
      await this.workspaceCacheStorageService.getOrInitializeFindAllViewsCacheGeneration(
        workspaceId,
      );

    if (!isDefined(generation)) {
      return undefined;
    }

    await this.synchronizeLocalCache(workspaceId, generation);

    return generation;
  }

  private async synchronizeLocalCache(
    workspaceId: string,
    generation: string,
  ): Promise<void> {
    if (this.getLocalGeneration(workspaceId) === generation) {
      return;
    }

    const synchronize = async () => {
      if (this.getLocalGeneration(workspaceId) === generation) {
        return;
      }

      await this.workspaceCacheService.invalidateLocal(workspaceId, [
        ...FIND_ALL_VIEWS_CACHE_DEPENDENCY_KEYS,
      ]);
      this.setLocalGeneration(workspaceId, generation);
    };
    const previousSynchronization =
      this.synchronizationByWorkspaceId.get(workspaceId);
    const synchronization = isDefined(previousSynchronization)
      ? previousSynchronization.then(synchronize, synchronize)
      : synchronize();

    this.synchronizationByWorkspaceId.set(workspaceId, synchronization);

    try {
      await synchronization;
    } finally {
      if (
        this.synchronizationByWorkspaceId.get(workspaceId) === synchronization
      ) {
        this.synchronizationByWorkspaceId.delete(workspaceId);
      }
    }
  }

  private getLocalGeneration(workspaceId: string): string | undefined {
    const generation = this.localGenerationByWorkspaceId.get(workspaceId);

    if (isDefined(generation)) {
      this.localGenerationByWorkspaceId.delete(workspaceId);
      this.localGenerationByWorkspaceId.set(workspaceId, generation);
    }

    return generation;
  }

  private setLocalGeneration(workspaceId: string, generation: string): void {
    this.localGenerationByWorkspaceId.delete(workspaceId);
    this.localGenerationByWorkspaceId.set(workspaceId, generation);

    if (this.localGenerationByWorkspaceId.size > MAX_LOCAL_GENERATIONS) {
      const oldestWorkspaceId = this.localGenerationByWorkspaceId
        .keys()
        .next().value;

      if (isDefined(oldestWorkspaceId)) {
        this.localGenerationByWorkspaceId.delete(oldestWorkspaceId);
      }
    }
  }
}
