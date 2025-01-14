import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { LogExecutionTime } from 'src/engine/decorators/observability/log-execution-time.decorator';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateObjectMetadataMaps } from 'src/engine/metadata-modules/utils/generate-object-metadata-maps.util';
import {
  WorkspaceMetadataCacheException,
  WorkspaceMetadataCacheExceptionCode,
} from 'src/engine/metadata-modules/workspace-metadata-cache/exceptions/workspace-metadata-cache.exception';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class WorkspaceMetadataCacheService {
  logger = new Logger(WorkspaceMetadataCacheService.name);

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  @LogExecutionTime()
  async recomputeMetadataCache({
    workspaceId,
    ignoreLock = false,
  }: {
    workspaceId: string;
    ignoreLock?: boolean;
  }): Promise<void> {
    const currentCacheVersion =
      await this.getMetadataVersionFromCache(workspaceId);

    const currentDatabaseVersion =
      await this.getMetadataVersionFromDatabase(workspaceId);

    if (currentDatabaseVersion === undefined) {
      throw new WorkspaceMetadataCacheException(
        'Metadata version not found in the database',
        WorkspaceMetadataCacheExceptionCode.METADATA_VERSION_NOT_FOUND,
      );
    }

    const isAlreadyCaching =
      await this.workspaceCacheStorageService.getObjectMetadataOngoingCachingLock(
        workspaceId,
        currentDatabaseVersion,
      );

    if (!ignoreLock && isAlreadyCaching) {
      return;
    }

    if (currentCacheVersion !== undefined) {
      this.workspaceCacheStorageService.flush(workspaceId, currentCacheVersion);
    }

    await this.workspaceCacheStorageService.addObjectMetadataCollectionOngoingCachingLock(
      workspaceId,
      currentDatabaseVersion,
    );

    await this.workspaceCacheStorageService.setMetadataVersion(
      workspaceId,
      currentDatabaseVersion,
    );

    const objectMetadataItems = await this.objectMetadataRepository.find({
      where: { workspaceId },
      relations: [
        'fields',
        'fields.fromRelationMetadata',
        'fields.toRelationMetadata',
        'indexMetadatas',
        'indexMetadatas.indexFieldMetadatas',
      ],
    });

    const freshObjectMetadataMaps =
      generateObjectMetadataMaps(objectMetadataItems);

    await this.workspaceCacheStorageService.setObjectMetadataMaps(
      workspaceId,
      currentDatabaseVersion,
      freshObjectMetadataMaps,
    );

    await this.workspaceCacheStorageService.removeObjectMetadataOngoingCachingLock(
      workspaceId,
      currentDatabaseVersion,
    );
  }

  private async getMetadataVersionFromDatabase(
    workspaceId: string,
  ): Promise<number | undefined> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    return workspace?.metadataVersion;
  }

  private async getMetadataVersionFromCache(
    workspaceId: string,
  ): Promise<number | undefined> {
    return await this.workspaceCacheStorageService.getMetadataVersion(
      workspaceId,
    );
  }
}
