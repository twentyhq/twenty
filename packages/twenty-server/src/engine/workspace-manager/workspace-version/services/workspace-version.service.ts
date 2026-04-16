import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, MoreThanOrEqual, QueryRunner, Repository } from 'typeorm';

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

  async getActiveOrSuspendedWorkspaceIds({
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
        activationStatus: In([
          WorkspaceActivationStatus.ACTIVE,
          WorkspaceActivationStatus.SUSPENDED,
        ]),
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
