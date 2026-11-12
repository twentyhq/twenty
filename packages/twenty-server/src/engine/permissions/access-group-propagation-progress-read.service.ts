/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { AccessGroupPropagationProgressService } from 'src/engine/permissions/internal/access-group/services/access-group-propagation-progress.service';
import { type AccessGroupPropagationProgress } from 'src/engine/permissions/internal/access-group/types/access-group-propagation-progress.type';

@Injectable()
export class AccessGroupPropagationProgressReadService {
  constructor(
    private readonly accessGroupPropagationProgressService: AccessGroupPropagationProgressService,
  ) {}

  findProgress(workspaceId: string): Promise<AccessGroupPropagationProgress> {
    return this.accessGroupPropagationProgressService.findProgress(workspaceId);
  }
}
