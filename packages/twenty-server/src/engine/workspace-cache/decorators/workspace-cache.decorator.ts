import { SetMetadata } from '@nestjs/common';

import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export type WorkspaceCacheOptions = {
  localDataOnly?: boolean;
  // Static packing cost weight (roughly the payload size). Heavier providers spend
  // more of a packing run's ponderation budget; one above the whole budget is never
  // packed inline. Defaults to DEFAULT_PACKING_PONDERATION when unset.
  packingPonderation?: number;
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
