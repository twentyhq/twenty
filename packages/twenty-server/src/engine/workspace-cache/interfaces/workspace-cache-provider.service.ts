import { Injectable } from '@nestjs/common';

import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';
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
  readonly rowsRequirement: WorkspaceCacheRowsRequirement = {};

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
