import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  type WorkspaceCacheDataMap,
  type WorkspaceDerivedCacheDataMap,
  type WorkspaceDerivedCacheKeyName,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { type WorkspaceDerivedCacheSourceKeyName } from 'src/engine/workspace-cache/types/workspace-derived-cache-source-key-name.type';

type DerivedDataBySourcesNode<TDerivedData> = {
  derivedData?: TDerivedData;
  nextNodeBySource: WeakMap<object, DerivedDataBySourcesNode<TDerivedData>>;
};

@Injectable()
export abstract class WorkspaceMultiSourceDerivedCacheProvider<
  TDerivedKeyName extends WorkspaceDerivedCacheKeyName =
    WorkspaceDerivedCacheKeyName,
  TSourceKeyName extends WorkspaceDerivedCacheSourceKeyName =
    WorkspaceDerivedCacheSourceKeyName,
> {
  abstract readonly sourceKeyNames: readonly [
    TSourceKeyName,
    ...TSourceKeyName[],
  ];

  private readonly derivedDataBySources: DerivedDataBySourcesNode<
    WorkspaceDerivedCacheDataMap[TDerivedKeyName]
  > = { nextNodeBySource: new WeakMap() };

  protected abstract computeFromSources(
    sources: Pick<WorkspaceCacheDataMap, TSourceKeyName>,
  ): WorkspaceDerivedCacheDataMap[TDerivedKeyName];

  getFromSources(
    sources: Pick<WorkspaceCacheDataMap, TSourceKeyName>,
  ): WorkspaceDerivedCacheDataMap[TDerivedKeyName] {
    return this.getOrComputeFromOrderedSources({
      orderedSources: this.sourceKeyNames.map(
        (sourceKeyName) => sources[sourceKeyName],
      ),
      compute: () => this.computeFromSources(sources),
    });
  }

  protected getOrComputeFromOrderedSources({
    orderedSources,
    compute,
  }: {
    orderedSources: readonly object[];
    compute: () => WorkspaceDerivedCacheDataMap[TDerivedKeyName];
  }): WorkspaceDerivedCacheDataMap[TDerivedKeyName] {
    let node = this.derivedDataBySources;

    for (const source of orderedSources) {
      let nextNode = node.nextNodeBySource.get(source);

      if (!isDefined(nextNode)) {
        nextNode = { nextNodeBySource: new WeakMap() };
        node.nextNodeBySource.set(source, nextNode);
      }

      node = nextNode;
    }

    if (isDefined(node.derivedData)) {
      return node.derivedData;
    }

    const derivedData = compute();

    node.derivedData = derivedData;

    return derivedData;
  }
}
