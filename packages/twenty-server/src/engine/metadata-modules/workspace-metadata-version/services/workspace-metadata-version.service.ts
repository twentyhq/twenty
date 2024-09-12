import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
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

  async incrementMetadataVersion(workspaceId: string): Promise<void> {
    const workspace = await this.getMetadataVersionFromDatabase(workspaceId);

    await this.workspaceRepository.save(workspace);

    this.workspaceCacheStorageService.invalidateWorkspaceCache(workspaceId);
  }

  async getMetadataVersionFromDatabase(
    workspaceId: string,
  ): Promise<number | undefined> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    return workspace?.metadataVersion;
  }
}
