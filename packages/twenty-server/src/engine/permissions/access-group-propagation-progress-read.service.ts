/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { AccessGroupPropagationPlanService } from 'src/engine/permissions/internal/access-group/services/access-group-propagation-plan.service';
import { type AccessGroupPropagationProgress } from 'src/engine/permissions/internal/access-group/types/access-group-propagation-progress.type';

@Injectable()
export class AccessGroupPropagationProgressReadService {
  constructor(
    private readonly accessGroupPropagationPlanService: AccessGroupPropagationPlanService,
  ) {}

  findProgress(workspaceId: string): Promise<AccessGroupPropagationProgress> {
    return this.accessGroupPropagationPlanService.findProgress(workspaceId);
  }
}
