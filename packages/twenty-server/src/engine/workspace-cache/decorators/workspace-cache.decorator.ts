import { SetMetadata } from '@nestjs/common';

import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const WORKSPACE_CACHE_KEY = 'WORKSPACE_CACHE_KEY';

export const WorkspaceCache = (workspaceCacheKeyName: WorkspaceCacheKeyName) =>
  SetMetadata(WORKSPACE_CACHE_KEY, workspaceCacheKeyName);
