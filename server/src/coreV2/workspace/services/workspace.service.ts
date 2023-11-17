import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { Workspace } from 'src/coreV2/workspace/workspace.entity';
import { WorkspaceManagerService } from 'src/workspace/workspace-manager/workspace-manager.service';

export class WorkspaceService extends TypeOrmQueryService<Workspace> {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly workspaceManagerService: WorkspaceManagerService,
  ) {
    super(workspaceRepository);
  }

  async deleteWorkspace(id: string) {
    const workspace = await this.workspaceRepository.findOneBy({ id });
    assert(workspace, 'Workspace not found');

    await this.workspaceManagerService.delete(id);

    return workspace;
  }
}
