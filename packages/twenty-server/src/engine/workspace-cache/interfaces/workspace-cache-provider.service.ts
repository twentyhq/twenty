import { Injectable } from '@nestjs/common';

import { type WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
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
  abstract computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): Promise<T>;

  compactForStorage(data: T): T | TCompact {
    return data;
  }

  expandFromStorage(compactData: T | TCompact): T {
    return compactData as T;
  }
}
