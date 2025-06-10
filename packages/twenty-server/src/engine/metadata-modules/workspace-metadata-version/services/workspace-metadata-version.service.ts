import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import {
  WorkspaceMetadataVersionException,
  WorkspaceMetadataVersionExceptionCode,
} from 'src/engine/metadata-modules/workspace-metadata-version/exceptions/workspace-metadata-version.exception';

@Injectable()
export class WorkspaceMetadataVersionService {
  logger = new Logger(WorkspaceMetadataCacheService.name);

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
  ) {}

  async incrementMetadataVersion(workspaceId: string): Promise<void> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    const metadataVersion = workspace?.metadataVersion;

    if (!isDefined(metadataVersion)) {
      throw new WorkspaceMetadataVersionException(
        'Metadata version not found',
        WorkspaceMetadataVersionExceptionCode.METADATA_VERSION_NOT_FOUND,
      );
    }

    const newMetadataVersion = metadataVersion + 1;

    await this.workspaceRepository.update(
      { id: workspaceId },
      { metadataVersion: newMetadataVersion },
    );

    await this.workspaceMetadataCacheService.recomputeMetadataCache({
      workspaceId,
    });
  }
}
