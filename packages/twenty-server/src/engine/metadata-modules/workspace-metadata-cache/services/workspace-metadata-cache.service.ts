import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { generateObjectMetadataMaps } from 'src/engine/metadata-modules/utils/generate-object-metadata-maps.util';
import {
  WorkspaceMetadataVersionException,
  WorkspaceMetadataVersionExceptionCode,
} from 'src/engine/metadata-modules/workspace-metadata-version/exceptions/workspace-metadata-version.exception';
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

  async recomputeMetadataCache({
    workspaceId,
    ignoreLock = false,
  }: {
    workspaceId: string;
    ignoreLock?: boolean;
  }): Promise<
    | {
        recomputedObjectMetadataMaps: ObjectMetadataMaps;
        recomputedMetadataVersion: number;
      }
    | undefined
  > {
    const currentCacheVersion =
      await this.getMetadataVersionFromCache(workspaceId);

    const currentDatabaseVersion =
      await this.getMetadataVersionFromDatabase(workspaceId);

    if (!isDefined(currentDatabaseVersion)) {
      throw new WorkspaceMetadataVersionException(
        'Metadata version not found in the database',
        WorkspaceMetadataVersionExceptionCode.METADATA_VERSION_NOT_FOUND,
      );
    }

    if (currentDatabaseVersion === currentCacheVersion) {
      return;
    }

    if (!ignoreLock) {
      const isAlreadyCaching =
        await this.workspaceCacheStorageService.getObjectMetadataOngoingCachingLock(
          workspaceId,
          currentDatabaseVersion,
        );

      if (isAlreadyCaching) {
        return;
      }
    }

    if (currentCacheVersion !== undefined) {
      this.workspaceCacheStorageService.flushVersionedMetadata(
        workspaceId,
        currentCacheVersion,
      );
    }

    try {
      await this.workspaceCacheStorageService.addObjectMetadataCollectionOngoingCachingLock(
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

      await this.workspaceCacheStorageService.setMetadataVersion(
        workspaceId,
        currentDatabaseVersion,
      );

      return {
        recomputedObjectMetadataMaps: freshObjectMetadataMaps,
        recomputedMetadataVersion: currentDatabaseVersion,
      };
    } finally {
      await this.workspaceCacheStorageService.removeObjectMetadataOngoingCachingLock(
        workspaceId,
        currentDatabaseVersion,
      );
    }
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
