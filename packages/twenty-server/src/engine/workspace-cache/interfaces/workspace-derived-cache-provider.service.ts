import { Injectable } from '@nestjs/common';

import {
  type WorkspaceCacheDataMap,
  type WorkspaceCacheKeyName,
  type WorkspaceDerivedCacheDataMap,
  type WorkspaceDerivedCacheKeyName,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';

@Injectable()
export abstract class WorkspaceDerivedCacheProvider<
  TDerivedKeyName extends WorkspaceDerivedCacheKeyName =
    WorkspaceDerivedCacheKeyName,
  TSourceKeyName extends WorkspaceCacheKeyName = WorkspaceCacheKeyName,
> {
  abstract readonly sourceKeyNames: readonly TSourceKeyName[];

  abstract computeFromSources(
    sources: Pick<WorkspaceCacheDataMap, TSourceKeyName>,
  ): WorkspaceDerivedCacheDataMap[TDerivedKeyName];
}
