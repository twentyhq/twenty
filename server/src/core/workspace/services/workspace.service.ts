import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { WorkspaceManagerService } from 'src/workspace/workspace-manager/workspace-manager.service';
import { Workspace } from 'src/core/workspace/workspace.entity';

export class WorkspaceService extends TypeOrmQueryService<Workspace> {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly workspaceManagerService: WorkspaceManagerService,
  ) {
    super(workspaceRepository);
  }

  async deleteWorkspace(id: string) {
    const workspace = await this.workspaceRepository.findOneBy({ id });

    assert(workspace, 'Workspace not found');

    await this.workspaceManagerService.delete(id);
    await this.workspaceRepository.delete(id);

    return workspace;
  }
}
