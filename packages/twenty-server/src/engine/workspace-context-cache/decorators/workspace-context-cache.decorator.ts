import { SetMetadata } from '@nestjs/common';

export const WORKSPACE_CONTEXT_CACHE_KEY = 'WORKSPACE_CONTEXT_CACHE_KEY';

export const WorkspaceContextCache = (cacheKey: string) =>
  SetMetadata(WORKSPACE_CONTEXT_CACHE_KEY, cacheKey);

