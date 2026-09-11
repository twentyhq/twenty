import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { SERVICEABLE_WORKSPACE_ACTIVATION_STATUSES } from 'src/modules/connected-account/webhook-subscription-manager/constants/serviceable-workspace-activation-statuses.constant';

@Injectable()
export class WorkspaceActivationService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

  async isWorkspaceServiceable(workspaceId: string): Promise<boolean> {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
        activationStatus: In(SERVICEABLE_WORKSPACE_ACTIVATION_STATUSES),
      },
      select: { id: true },
    });

    return isDefined(workspace);
  }

  async isWorkspaceServiceableFromCache(workspaceId: string): Promise<boolean> {
    const workspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      workspaceId,
    );

    return (
      isDefined(workspace) &&
      !isDefined(workspace.deletedAt) &&
      SERVICEABLE_WORKSPACE_ACTIVATION_STATUSES.includes(
        workspace.activationStatus,
      )
    );
  }
}
