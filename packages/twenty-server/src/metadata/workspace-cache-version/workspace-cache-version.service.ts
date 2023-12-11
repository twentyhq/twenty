import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheVersionEntity } from 'src/metadata/workspace-cache-version/workspace-cache-version.entity';

@Injectable()
export class WorkspaceCacheVersionService {
  constructor(
    @InjectRepository(WorkspaceCacheVersionEntity, 'metadata')
    private readonly workspaceCacheVersionRepository: Repository<WorkspaceCacheVersionEntity>,
  ) {}

  async incrementVersion(workspaceId: string): Promise<void> {
    const workspaceCacheVersion =
      (await this.workspaceCacheVersionRepository.findOne({
        where: { workspaceId },
      })) ?? { version: '0' };

    await this.workspaceCacheVersionRepository.upsert(
      {
        workspaceId,
        version: `${+workspaceCacheVersion.version + 1}`,
      },
      ['workspaceId'],
    );
  }

  async getVersion(workspaceId: string): Promise<string> {
    const workspaceCacheVersion =
      await this.workspaceCacheVersionRepository.findOne({
        where: { workspaceId },
      });

    return workspaceCacheVersion?.version ?? '0';
  }
}
