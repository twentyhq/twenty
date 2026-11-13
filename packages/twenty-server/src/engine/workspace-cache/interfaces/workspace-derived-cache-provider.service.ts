import { Injectable } from '@nestjs/common';

import { WorkspaceMultiSourceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-multi-source-derived-cache-provider.service';

import {
  type WorkspaceCacheDataMap,
  type WorkspaceDerivedCacheDataMap,
  type WorkspaceDerivedCacheKeyName,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { type WorkspaceDerivedCacheSourceKeyName } from 'src/engine/workspace-cache/types/workspace-derived-cache-source-key-name.type';

@Injectable()
export abstract class WorkspaceDerivedCacheProvider<
  TDerivedKeyName extends WorkspaceDerivedCacheKeyName =
    WorkspaceDerivedCacheKeyName,
  TSourceKeyName extends WorkspaceDerivedCacheSourceKeyName =
    WorkspaceDerivedCacheSourceKeyName,
> extends WorkspaceMultiSourceDerivedCacheProvider<
  TDerivedKeyName,
  TSourceKeyName
> {
  abstract readonly sourceKeyName: TSourceKeyName;

  get sourceKeyNames(): readonly [TSourceKeyName] {
    return [this.sourceKeyName];
  }

  protected abstract computeFromSource(
    source: WorkspaceCacheDataMap[TSourceKeyName],
  ): WorkspaceDerivedCacheDataMap[TDerivedKeyName];

  protected computeFromSources(
    sources: Pick<WorkspaceCacheDataMap, TSourceKeyName>,
  ): WorkspaceDerivedCacheDataMap[TDerivedKeyName] {
    return this.computeFromSource(sources[this.sourceKeyName]);
  }

  getFromSource(
    source: WorkspaceCacheDataMap[TSourceKeyName],
  ): WorkspaceDerivedCacheDataMap[TDerivedKeyName] {
    return this.getOrComputeFromOrderedSources({
      orderedSources: [source],
      compute: () => this.computeFromSource(source),
    });
  }
}
