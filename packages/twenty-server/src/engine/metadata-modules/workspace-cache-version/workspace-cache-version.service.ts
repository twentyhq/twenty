import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheVersionEntity } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.entity';

@Injectable()
export class WorkspaceCacheVersionService {
  constructor(
    @InjectRepository(WorkspaceCacheVersionEntity, 'metadata')
    private readonly workspaceCacheVersionRepository: Repository<WorkspaceCacheVersionEntity>,
  ) {}

  async incrementVersion(workspaceId: string): Promise<string> {
    const workspaceCacheVersion = (await this.getVersion(workspaceId)) ?? '0';
    const newVersion = `${+workspaceCacheVersion + 1}`;

    await this.workspaceCacheVersionRepository.upsert(
      {
        workspaceId,
        version: `${+workspaceCacheVersion + 1}`,
      },
      ['workspaceId'],
    );

    return newVersion;
  }

  async getVersion(workspaceId: string): Promise<string | null> {
    const workspaceCacheVersion =
      await this.workspaceCacheVersionRepository.findOne({
        where: { workspaceId },
      });

    return workspaceCacheVersion?.version ?? null;
  }
}
