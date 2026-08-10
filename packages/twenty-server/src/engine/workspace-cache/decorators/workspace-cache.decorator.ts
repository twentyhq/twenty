import { SetMetadata } from '@nestjs/common';

import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export type WorkspaceCacheOptions = {
  // Never written to Redis: the value is not shareable across pods, or shipping
  // it is not worth the bytes. Says nothing about whether it can be serialized.
  localDataOnly?: boolean;
  // Whether the provider's encode/decode pair round trips the value, which is
  // what cold storage needs. Defaults to `!localDataOnly`; set explicitly for a
  // provider that is local-only but still has a working codec.
  coldStorable?: boolean;
};

export const WORKSPACE_CACHE_KEY = 'WORKSPACE_CACHE_KEY';
export const WORKSPACE_CACHE_OPTIONS = 'WORKSPACE_CACHE_OPTIONS';

export const WorkspaceCache = (
  workspaceCacheKeyName: WorkspaceCacheKeyName,
  options?: WorkspaceCacheOptions,
): ClassDecorator => {
  return (target) => {
    SetMetadata(WORKSPACE_CACHE_KEY, workspaceCacheKeyName)(target);
    SetMetadata(WORKSPACE_CACHE_OPTIONS, options ?? {})(target);
  };
};
