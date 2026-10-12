import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  type WorkspaceCacheDataMap,
  type WorkspaceCacheKeyName,
  type WorkspaceDerivedCacheDataMap,
  type WorkspaceDerivedCacheKeyName,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';

type WorkspaceDerivedCacheSourceKeyName = {
  [TCacheKeyName in WorkspaceCacheKeyName]: WorkspaceCacheDataMap[TCacheKeyName] extends object
    ? TCacheKeyName
    : never;
}[WorkspaceCacheKeyName];

@Injectable()
export abstract class WorkspaceDerivedCacheProvider<
  TDerivedKeyName extends WorkspaceDerivedCacheKeyName =
    WorkspaceDerivedCacheKeyName,
  TSourceKeyName extends WorkspaceDerivedCacheSourceKeyName =
    WorkspaceDerivedCacheSourceKeyName,
> {
  abstract readonly sourceKeyName: TSourceKeyName;

  private readonly derivedDataBySource = new WeakMap<
    WorkspaceCacheDataMap[TSourceKeyName],
    WorkspaceDerivedCacheDataMap[TDerivedKeyName]
  >();

  protected abstract computeFromSource(
    source: WorkspaceCacheDataMap[TSourceKeyName],
  ): WorkspaceDerivedCacheDataMap[TDerivedKeyName];

  getFromSource(
    source: WorkspaceCacheDataMap[TSourceKeyName],
  ): WorkspaceDerivedCacheDataMap[TDerivedKeyName] {
    const memoizedDerivedData = this.derivedDataBySource.get(source);

    if (isDefined(memoizedDerivedData)) {
      return memoizedDerivedData;
    }

    const derivedData = this.computeFromSource(source);

    this.derivedDataBySource.set(source, derivedData);

    return derivedData;
  }
}
