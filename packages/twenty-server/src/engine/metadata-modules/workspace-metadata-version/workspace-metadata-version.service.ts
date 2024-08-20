import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class WorkspaceMetadataVersionService {
  logger = new Logger(WorkspaceMetadataVersionService.name);

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  async flushCacheIfMetadataVersionIsOutdated(
    workspaceId: string,
  ): Promise<void> {
    const currentVersion =
      (await this.workspaceCacheStorageService.getMetadataVersion(
        workspaceId,
      )) ?? 1;

    let latestVersion = await this.getMetadataVersion(workspaceId);

    if (latestVersion === undefined || currentVersion !== latestVersion) {
      this.logger.log(
        `Metadata version mismatch detected for workspace ${workspaceId}. Current version: ${currentVersion}. Latest version: ${latestVersion}. Invalidating cache...`,
      );

      await this.workspaceCacheStorageService.flush(workspaceId);

      latestVersion = await this.incrementMetadataVersion(workspaceId);

      await this.workspaceCacheStorageService.setMetadataVersion(
        workspaceId,
        latestVersion,
      );
    }
  }

  async incrementMetadataVersion(workspaceId: string): Promise<number> {
    const metadataVersion = (await this.getMetadataVersion(workspaceId)) ?? 0;
    const newMetadataVersion = metadataVersion + 1;

    await this.workspaceRepository.update(
      { id: workspaceId },
      { metadataVersion: newMetadataVersion },
    );

    await this.workspaceCacheStorageService.setMetadataVersion(
      workspaceId,
      newMetadataVersion,
    );

    return newMetadataVersion;
  }

  async getMetadataVersion(workspaceId: string): Promise<number | undefined> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    return workspace?.metadataVersion;
  }

  async resetMetadataVersion(workspaceId: string): Promise<void> {
    await this.workspaceRepository.update(
      { id: workspaceId },
      { metadataVersion: 1 },
    );

    await this.workspaceCacheStorageService.flush(workspaceId);
    await this.workspaceCacheStorageService.setMetadataVersion(workspaceId, 1);
  }
}
