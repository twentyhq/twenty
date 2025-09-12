import { SetMetadata } from '@nestjs/common';

export const WORKSPACE_FLAT_MAP_CACHE_KEY = 'workspaceFlatMapCacheKey';

export const WorkspaceFlatMapCache = (cacheKey: string) =>
  SetMetadata(WORKSPACE_FLAT_MAP_CACHE_KEY, cacheKey);
