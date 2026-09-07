import { SetMetadata, type Type } from '@nestjs/common';

import { type WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import {
  type WorkspaceCacheDataMap,
  type WorkspaceCacheKeyName,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export type WorkspaceCacheOptions = {
  packingPonderation: number;
  localDataOnly?: boolean;
};

export const WORKSPACE_CACHE_KEY = 'WORKSPACE_CACHE_KEY';
export const WORKSPACE_CACHE_OPTIONS = 'WORKSPACE_CACHE_OPTIONS';

export const WorkspaceCache =
  <TKeyName extends WorkspaceCacheKeyName>(
    workspaceCacheKeyName: TKeyName,
    options: WorkspaceCacheOptions,
  ) =>
  <
    TProviderClass extends Type<
      WorkspaceCacheProvider<WorkspaceCacheDataMap[TKeyName], unknown>
    >,
  >(
    target: TProviderClass,
  ): TProviderClass => {
    SetMetadata(WORKSPACE_CACHE_KEY, workspaceCacheKeyName)(target);
    SetMetadata(WORKSPACE_CACHE_OPTIONS, options)(target);

    return target;
  };
