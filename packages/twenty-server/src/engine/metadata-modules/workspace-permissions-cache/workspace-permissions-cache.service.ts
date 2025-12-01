import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class WorkspacePermissionsCacheService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async getRoleIdFromUserWorkspaceId({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId?: string;
  }): Promise<string | undefined> {
    if (!isDefined(userWorkspaceId)) {
      return;
    }

    const { userWorkspaceRoleMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'userWorkspaceRoleMap',
      ]);

    return userWorkspaceRoleMap[userWorkspaceId];
  }
}
