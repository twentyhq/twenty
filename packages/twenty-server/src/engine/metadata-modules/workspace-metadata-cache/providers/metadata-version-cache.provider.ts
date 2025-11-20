import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
    WorkspaceMetadataVersionException,
    WorkspaceMetadataVersionExceptionCode,
} from 'src/engine/metadata-modules/workspace-metadata-version/exceptions/workspace-metadata-version.exception';
import { WorkspaceContextCache } from 'src/engine/workspace-context-cache/decorators/workspace-context-cache.decorator';
import { WorkspaceContextCacheProvider } from 'src/engine/workspace-context-cache/workspace-context-cache-provider.service';

@Injectable()
@WorkspaceContextCache('metadataVersion')
export class MetadataVersionCacheProvider extends WorkspaceContextCacheProvider<number> {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<number> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!isDefined(workspace?.metadataVersion)) {
      throw new WorkspaceMetadataVersionException(
        'Metadata version not found in the database',
        WorkspaceMetadataVersionExceptionCode.METADATA_VERSION_NOT_FOUND,
      );
    }

    return workspace.metadataVersion;
  }

  dataCacheKey(workspaceId: string): string {
    return `metadata:workspace-metadata-version:${workspaceId}`;
  }

  hashCacheKey(workspaceId: string): string {
    return `metadata:workspace-metadata-version:${workspaceId}:hash`;
  }
}
