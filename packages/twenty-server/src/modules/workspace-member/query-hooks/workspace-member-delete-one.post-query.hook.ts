import { InjectRepository } from '@nestjs/typeorm';

import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceMemberPreQueryHookService } from 'src/modules/workspace-member/query-hooks/workspace-member-pre-query-hook.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceQueryHook({
  key: `workspaceMember.deleteOne`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class WorkspaceMemberDeleteOnePostQueryHook
  implements WorkspacePostQueryHookInstance
{
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly workspaceMemberPreQueryHookService: WorkspaceMemberPreQueryHookService,
    private readonly userWorkspaceService: UserWorkspaceService,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: WorkspaceMemberWorkspaceEntity[],
  ): Promise<void> {
    if (!payload || payload.length === 0) {
      return;
    }

    const deletedWorkspaceMember = payload[0];
    const targettedWorkspaceMemberId = deletedWorkspaceMember.id;

    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.workspaceMemberPreQueryHookService.validateWorkspaceMemberUpdatePermissionOrThrow(
      {
        userWorkspaceId: authContext.userWorkspaceId,
        workspaceMemberId: authContext.workspaceMemberId,
        targettedWorkspaceMemberId,
        workspaceId: workspace.id,
        apiKey: authContext.apiKey,
      },
    );

    const workspaceMember =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext as WorkspaceAuthContext,
        async () => {
          const workspaceMemberRepository =
            await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
              workspace.id,
              'workspaceMember',
            );

          return workspaceMemberRepository.findOne({
            where: {
              id: targettedWorkspaceMemberId,
            },
            withDeleted: true,
          });
        },
      );

    if (!isDefined(workspaceMember)) {
      throw new PermissionsException(
        'Workspace member not found',
        PermissionsExceptionCode.WORKSPACE_MEMBER_NOT_FOUND,
      );
    }

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        workspaceId: workspace.id,
        userId: workspaceMember.userId,
      },
    });

    if (!isDefined(userWorkspace)) {
      throw new PermissionsException(
        'User workspace not found',
        PermissionsExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

    await this.userWorkspaceService.deleteUserWorkspace({
      userWorkspaceId: userWorkspace.id,
    });
  }
}
