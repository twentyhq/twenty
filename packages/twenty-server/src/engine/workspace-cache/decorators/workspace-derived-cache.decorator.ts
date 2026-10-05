import { SetMetadata, type Type } from '@nestjs/common';

import { type WorkspaceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-derived-cache-provider.service';
import { type WorkspaceDerivedCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const WORKSPACE_DERIVED_CACHE_KEY = 'WORKSPACE_DERIVED_CACHE_KEY';

export const WorkspaceDerivedCache =
  <TDerivedKeyName extends WorkspaceDerivedCacheKeyName>(
    workspaceDerivedCacheKeyName: TDerivedKeyName,
  ) =>
  <TProviderClass extends Type<WorkspaceDerivedCacheProvider<TDerivedKeyName>>>(
    target: TProviderClass,
  ): TProviderClass => {
    SetMetadata(
      WORKSPACE_DERIVED_CACHE_KEY,
      workspaceDerivedCacheKeyName,
    )(target);

    return target;
  };
