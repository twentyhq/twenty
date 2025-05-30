import { Injectable } from '@nestjs/common';

import {
  WorkspaceMetadataCacheException,
  WorkspaceMetadataCacheExceptionCode,
} from 'src/engine/metadata-modules/workspace-metadata-cache/exceptions/workspace-metadata-cache.exception';
import {
  WorkspaceMetadataVersionException,
  WorkspaceMetadataVersionExceptionCode,
} from 'src/engine/metadata-modules/workspace-metadata-version/exceptions/workspace-metadata-version.exception';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class ObjectMetadataMapsService {
  constructor(
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  async getObjectMetadataMapsOrThrow(workspaceId: string) {
    const currentCacheVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspaceId);

    if (currentCacheVersion === undefined) {
      throw new WorkspaceMetadataVersionException(
        `Metadata version not found for workspace ${workspaceId}`,
        WorkspaceMetadataVersionExceptionCode.METADATA_VERSION_NOT_FOUND,
      );
    }

    const objectMetadataMaps =
      await this.workspaceCacheStorageService.getObjectMetadataMaps(
        workspaceId,
        currentCacheVersion,
      );

    if (!objectMetadataMaps) {
      throw new WorkspaceMetadataCacheException(
        `Object metadata map not found for workspace ${workspaceId} and metadata version ${currentCacheVersion}`,
        WorkspaceMetadataCacheExceptionCode.OBJECT_METADATA_MAP_NOT_FOUND,
      );
    }

    return objectMetadataMaps;
  }
}
