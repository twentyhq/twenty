import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class ConnectedAccountOwnerService {
  constructor(
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async findOwnerWorkspaceMemberId({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<string | null> {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { id: userWorkspaceId, workspaceId },
    });

    if (!isDefined(userWorkspace)) {
      return null;
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workspaceMember = await this.workspaceOrmManager
          .getRepository<WorkspaceMemberWorkspaceEntity>('workspaceMember', {
            shouldBypassPermissionChecks: true,
          })
          .findOne({
            where: { userId: userWorkspace.userId },
            select: { id: true },
          });

        return workspaceMember?.id ?? null;
      },
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }
}
