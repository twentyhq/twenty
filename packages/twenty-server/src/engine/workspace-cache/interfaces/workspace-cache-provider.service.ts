import { Injectable } from '@nestjs/common';

import {
  type WorkspaceCacheDataMap,
  type WorkspaceCacheKeyName,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';

type WorkspaceCacheDataType = WorkspaceCacheDataMap[WorkspaceCacheKeyName];

@Injectable()
export abstract class WorkspaceCacheProvider<
  T extends WorkspaceCacheDataType = WorkspaceCacheDataType,
> {
  abstract computeForCache(workspaceId: string): Promise<T>;

  // Override to store a smaller shape in Redis than the one held in memory. Entries are
  // hash-versioned and disposable, so a codec change needs no migration or legacy read support.
  encodeForCacheStorage(data: T): unknown {
    return data;
  }

  decodeFromCacheStorage(rawData: unknown): T {
    return rawData as T;
  }
}
