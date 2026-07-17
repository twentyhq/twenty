import { Injectable } from '@nestjs/common';

import {
  type WorkspaceCacheDataMap,
  type WorkspaceCacheKeyName,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';

type WorkspaceCacheDataType = WorkspaceCacheDataMap[WorkspaceCacheKeyName];

export type WorkspaceCacheComputeResult<T> = {
  data: T;
  contentHash: string | null;
};

@Injectable()
export abstract class WorkspaceCacheProvider<
  T extends WorkspaceCacheDataType = WorkspaceCacheDataType,
> {
  abstract computeForCache(workspaceId: string): Promise<T>;

  async computeForCacheWithContentHash(
    workspaceId: string,
  ): Promise<WorkspaceCacheComputeResult<T>> {
    return {
      data: await this.computeForCache(workspaceId),
      contentHash: null,
    };
  }
}
