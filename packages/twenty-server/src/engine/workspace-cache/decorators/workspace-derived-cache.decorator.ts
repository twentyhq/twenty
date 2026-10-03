import { SetMetadata, type Type } from '@nestjs/common';

import { type WorkspaceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-derived-cache-provider.service';
import {
  type WorkspaceCacheKeyName,
  type WorkspaceDerivedCacheKeyName,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export type WorkspaceDerivedCacheOptions = {
  maxMemoizedWorkspaces: number;
};

export const WORKSPACE_DERIVED_CACHE_KEY = 'WORKSPACE_DERIVED_CACHE_KEY';
export const WORKSPACE_DERIVED_CACHE_OPTIONS =
  'WORKSPACE_DERIVED_CACHE_OPTIONS';

export const WorkspaceDerivedCache =
  <TDerivedKeyName extends WorkspaceDerivedCacheKeyName>(
    workspaceDerivedCacheKeyName: TDerivedKeyName,
    options: WorkspaceDerivedCacheOptions,
  ) =>
  <
    TProviderClass extends Type<
      WorkspaceDerivedCacheProvider<TDerivedKeyName, WorkspaceCacheKeyName>
    >,
  >(
    target: TProviderClass,
  ): TProviderClass => {
    SetMetadata(
      WORKSPACE_DERIVED_CACHE_KEY,
      workspaceDerivedCacheKeyName,
    )(target);
    SetMetadata(WORKSPACE_DERIVED_CACHE_OPTIONS, options)(target);

    return target;
  };
