import { InjectRepository } from '@nestjs/typeorm';

import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { type AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { WorkspaceMemberPreQueryHookService } from 'src/modules/workspace-member/query-hooks/workspace-member-pre-query-hook.service';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceQueryHook({
  key: `workspaceMember.deleteOne`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class WorkspaceMemberDeleteOnePostQueryHook
  implements WorkspacePostQueryHookInstance
{
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    @InjectRepository(UserWorkspace)
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly workspaceMemberPreQueryHookService: WorkspaceMemberPreQueryHookService,
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

    const attachmentRepository =
      await this.twentyORMManager.getRepository<AttachmentWorkspaceEntity>(
        'attachment',
      );

    const authorId = targettedWorkspaceMemberId;

    await attachmentRepository.delete({
      authorId,
    });

    const workspaceMemberRepository =
      await this.twentyORMManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        'workspaceMember',
      );

    const workspaceMember = await workspaceMemberRepository.findOne({
      where: {
        id: targettedWorkspaceMemberId,
      },
      withDeleted: true,
    });

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

    await this.userWorkspaceRepository.delete(userWorkspace.id);
  }
}
