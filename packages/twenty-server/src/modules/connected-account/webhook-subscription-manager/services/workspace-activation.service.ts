import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class WorkspaceActivationService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly coreEntityCacheService: CoreEntityCacheService,
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

  async isWorkspaceSuspendedFromCache(workspaceId: string): Promise<boolean> {
    const workspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      workspaceId,
    );

    return (
      isDefined(workspace) &&
      workspace.activationStatus === WorkspaceActivationStatus.SUSPENDED
    );
  }
}
