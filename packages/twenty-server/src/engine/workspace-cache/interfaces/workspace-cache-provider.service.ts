import { Injectable } from '@nestjs/common';

import { type WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { type EntityFetchRequirement } from 'src/engine/workspace-cache/types/entity-fetch-requirement.type';
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
  // Every core-schema table computeForCache reads must be declared here; the
  // requirements of all providers recomputed together are merged into one
  // deterministic fetch plan executed before any computeForCache runs, and
  // recomputeContext.getRows throws on undeclared entities.
  readonly fetchRequirements: EntityFetchRequirement[] = [];

  abstract computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): Promise<T> | T;

  compactForStorage(data: T): T | TCompact {
    return data;
  }

  expandFromStorage(compactData: T | TCompact): T {
    return compactData as T;
  }
}
