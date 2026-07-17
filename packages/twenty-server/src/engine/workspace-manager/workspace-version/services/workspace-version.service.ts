import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PROVISIONED_WORKSPACE_ACTIVATION_STATUSES } from 'twenty-shared/workspace';
import { MoreThanOrEqual, QueryRunner, Repository } from 'typeorm';

import { activationStatusIn } from 'src/database/commands/command-runners/utils/activation-status-in.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class WorkspaceVersionService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async hasProvisionedWorkspaces(): Promise<boolean> {
    return this.workspaceRepository.exists({
      where: {
        activationStatus: activationStatusIn(
          PROVISIONED_WORKSPACE_ACTIVATION_STATUSES,
        ),
      },
    });
  }

  async getProvisionedWorkspaceIds({
    startFromWorkspaceId,
    workspaceCountLimit,
    queryRunner,
  }: {
    startFromWorkspaceId?: string;
    workspaceCountLimit?: number;
    queryRunner?: QueryRunner;
  } = {}): Promise<string[]> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(WorkspaceEntity)
      : this.workspaceRepository;

    const workspaces = await repository.find({
      select: ['id'],
      where: {
        activationStatus: activationStatusIn(
          PROVISIONED_WORKSPACE_ACTIVATION_STATUSES,
        ),
        ...(startFromWorkspaceId
          ? { id: MoreThanOrEqual(startFromWorkspaceId) }
          : {}),
      },
      order: { id: 'ASC' },
      take: workspaceCountLimit,
    });

    return workspaces.map((workspace) => workspace.id);
  }
}
