import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, Repository } from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class WorkspaceVersionService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async hasActiveOrSuspendedWorkspaces(): Promise<boolean> {
    return this.workspaceRepository.exists({
      where: {
        activationStatus: In([
          WorkspaceActivationStatus.ACTIVE,
          WorkspaceActivationStatus.SUSPENDED,
        ]),
      },
    });
  }
}
