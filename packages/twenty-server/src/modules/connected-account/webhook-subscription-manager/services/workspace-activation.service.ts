import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';

@Injectable()
export class WorkspaceActivationService {
  constructor(
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

  async isWorkspaceSuspended(workspaceId: string): Promise<boolean> {
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
