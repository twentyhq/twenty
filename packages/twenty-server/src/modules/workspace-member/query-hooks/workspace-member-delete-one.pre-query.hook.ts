import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { DeleteOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { WorkspaceMemberPreQueryHookService } from 'src/modules/workspace-member/query-hooks/workspace-member-pre-query-hook.service';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';

@WorkspaceQueryHook(`workspaceMember.deleteOne`)
export class WorkspaceMemberDeleteOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
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

    return payload;
  }
}
