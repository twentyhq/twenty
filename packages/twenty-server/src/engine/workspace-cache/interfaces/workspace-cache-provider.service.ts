import { Injectable } from '@nestjs/common';

import {
  type WorkspaceCacheDataMap,
  type WorkspaceCacheKeyName,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';

type WorkspaceCacheDataType = WorkspaceCacheDataMap[WorkspaceCacheKeyName];

@Injectable()
export abstract class WorkspaceCacheProvider<
  T extends WorkspaceCacheDataType = WorkspaceCacheDataType,
  TCompact = T,
> {
  abstract computeForCache(workspaceId: string): Promise<T>;

  compactForStorage(data: T): T | TCompact {
    return data;
  }

  expandFromStorage(compactData: T | TCompact): T {
    return compactData as T;
  }
}
