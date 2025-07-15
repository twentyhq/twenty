import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { DeleteOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { WorkspaceMemberPreQueryHookService } from 'src/modules/workspace-member/query-hooks/workspace-member-pre-query-hook.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceQueryHook(`workspaceMember.deleteOne`)
export class WorkspaceMemberDeleteOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly workspaceMemberPreQueryHookService: WorkspaceMemberPreQueryHookService,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: DeleteOneResolverArgs,
  ): Promise<DeleteOneResolverArgs> {
    const targettedWorkspaceMemberId = payload.id;

    const workspace = authContext.workspace;

    workspaceValidator.assertIsDefinedOrThrow(workspace);

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
    });

    if (!isDefined(workspaceMember)) {
      // TODO: once this is migrated to userWorkspace service we should throw UserWorkspaceException
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

    return payload;
  }
}
