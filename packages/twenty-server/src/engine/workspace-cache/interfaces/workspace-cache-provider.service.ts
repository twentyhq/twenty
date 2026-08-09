import { Injectable } from '@nestjs/common';

import {
  type WorkspaceCacheDataMap,
  type WorkspaceCacheKeyName,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';

type WorkspaceCacheDataType = WorkspaceCacheDataMap[WorkspaceCacheKeyName];

@Injectable()
export abstract class WorkspaceCacheProvider<
  T extends WorkspaceCacheDataType = WorkspaceCacheDataType,
  TEncoded = T,
> {
  abstract computeForCache(workspaceId: string): Promise<T>;

  encodeForCacheStorage(data: T): T | TEncoded {
    return data;
  }

  decodeFromCacheStorage(rawData: T | TEncoded): T {
    return rawData as T;
  }
}
