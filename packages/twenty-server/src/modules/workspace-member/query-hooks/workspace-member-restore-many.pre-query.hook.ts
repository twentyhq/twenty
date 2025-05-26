import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { RestoreManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceMemberPreQueryHookService } from 'src/modules/workspace-member/query-hooks/workspace-member-pre-query-hook.service';

@WorkspaceQueryHook(`workspaceMember.restoreMany`)
export class WorkspaceMemberRestoreManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly workspaceMemberPreQueryHookService: WorkspaceMemberPreQueryHookService,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: RestoreManyResolverArgs,
  ): Promise<RestoreManyResolverArgs> {
    await this.workspaceMemberPreQueryHookService.validateWorkspaceMemberUpdatePermissionOrThrow(
      {
        userWorkspaceId: authContext.userWorkspaceId,
        workspaceId: authContext.workspace.id,
        apiKey: authContext.apiKey,
        workspaceMemberId: authContext.workspaceMemberId,
      },
    );

    return payload;
  }
}
