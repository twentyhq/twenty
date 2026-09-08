import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class WorkspaceActivationService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async isWorkspaceSuspended(workspaceId: string): Promise<boolean> {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
        activationStatus: WorkspaceActivationStatus.SUSPENDED,
      },
      select: { id: true },
    });

    return isDefined(workspace);
  }
}
