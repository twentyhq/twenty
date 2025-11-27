import { SetMetadata } from '@nestjs/common';

export const WORKSPACE_CACHE_KEY = 'WORKSPACE_CACHE_KEY';

export const WorkspaceCache = (workspaceCacheKey: string) =>
  SetMetadata(WORKSPACE_CACHE_KEY, workspaceCacheKey);
