import { Injectable } from '@nestjs/common';

import { type CacheEntityFetchShape } from 'src/engine/workspace-cache/types/cache-entity-fetch-shape.type';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
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
  // Every core-schema table computeForCache reads must be declared here,
  // keyed by CACHE_FETCHABLE_ENTITY_BY_NAME entries; the requirements of all
  // providers recomputed together are merged into one deterministic fetch
  // plan executed before any computeForCache runs, and the context's rows
  // carry exactly what was declared.
  readonly rowsRequirement: CacheEntityFetchShape = {};

  abstract computeForCache(
    context: WorkspaceCacheProviderContext,
  ): Promise<T> | T;

  compactForStorage(data: T): T | TCompact {
    return data;
  }

  expandFromStorage(compactData: T | TCompact): T {
    return compactData as T;
  }
}
