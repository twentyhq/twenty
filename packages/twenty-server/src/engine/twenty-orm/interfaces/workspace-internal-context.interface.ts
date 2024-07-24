import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

export interface WorkspaceInternalContext {
  workspaceId: string;
  workspaceCacheStorage: WorkspaceCacheStorageService;
}
