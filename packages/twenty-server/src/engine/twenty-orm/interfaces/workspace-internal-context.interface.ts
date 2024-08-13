import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

export interface WorkspaceInternalContext {
  workspaceId: string;
  workspaceCacheStorage: WorkspaceCacheStorageService;
  objectMetadataCollection: ObjectMetadataEntity[];
}
