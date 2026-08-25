import { Injectable } from '@nestjs/common';

import { type WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { type CacheEntityFetchShape } from 'src/engine/workspace-cache/types/cache-entity-fetch-shape.type';
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
  // keyed by CACHE_FETCHABLE_ENTITY_BY_NAME entries; the shapes of all
  // providers recomputed together are merged into one deterministic fetch
  // plan executed before any computeForCache runs, and
  // recomputeContext.getRowsByName throws on undeclared entity names.
  readonly fetchRequirements: CacheEntityFetchShape = {};

  abstract computeForCache(
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): Promise<T> | T;

  compactForStorage(data: T): T | TCompact {
    return data;
  }

  expandFromStorage(compactData: T | TCompact): T {
    return compactData as T;
  }
}
