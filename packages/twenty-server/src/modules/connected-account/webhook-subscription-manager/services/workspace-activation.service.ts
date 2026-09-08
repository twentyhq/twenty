import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DEACTIVATED_WORKSPACE_ACTIVATION_STATUSES } from 'src/modules/connected-account/webhook-subscription-manager/constants/deactivated-workspace-activation-statuses.constant';

@Injectable()
export class WorkspaceActivationService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async isWorkspaceDeactivated(workspaceId: string): Promise<boolean> {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
        activationStatus: In(DEACTIVATED_WORKSPACE_ACTIVATION_STATUSES),
      },
      select: { id: true },
    });

    return isDefined(workspace);
  }
}
