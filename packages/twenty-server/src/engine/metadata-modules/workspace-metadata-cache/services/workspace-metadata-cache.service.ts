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

type GetFreshObjectMetadataMapsResult = {
  objectMetadataMaps: ObjectMetadataMaps;
  metadataVersion: number;
};

@Injectable()
export class WorkspaceMetadataCacheService {
  logger = new Logger(WorkspaceMetadataCacheService.name);

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  async getFreshObjectMetadataMaps({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<GetFreshObjectMetadataMapsResult> {
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

    const shouldRecompute =
      !isDefined(currentCacheVersion) ||
      currentCacheVersion !== currentDatabaseVersion;

    const existingObjectMetadataMaps =
      await this.workspaceCacheStorageService.getObjectMetadataMaps(
        workspaceId,
        currentDatabaseVersion,
      );

    if (isDefined(existingObjectMetadataMaps) && !shouldRecompute) {
      return {
        objectMetadataMaps: existingObjectMetadataMaps,
        metadataVersion: currentDatabaseVersion,
      };
    }

    const { objectMetadataMaps, metadataVersion } =
      await this.recomputeMetadataCache({
        workspaceId,
      });

    return {
      objectMetadataMaps,
      metadataVersion,
    };
  }

  async recomputeMetadataCache({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<GetFreshObjectMetadataMapsResult> {
    const currentDatabaseVersion =
      await this.getMetadataVersionFromDatabase(workspaceId);

    if (!isDefined(currentDatabaseVersion)) {
      throw new WorkspaceMetadataVersionException(
        'Metadata version not found in the database',
        WorkspaceMetadataVersionExceptionCode.METADATA_VERSION_NOT_FOUND,
      );
    }

    await this.workspaceCacheStorageService.flushVersionedMetadata(workspaceId);

    const objectMetadataItems = await this.objectMetadataRepository.find({
      where: { workspaceId },
      relations: [
        'fields',
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
      objectMetadataMaps: freshObjectMetadataMaps,
      metadataVersion: currentDatabaseVersion,
    };
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
