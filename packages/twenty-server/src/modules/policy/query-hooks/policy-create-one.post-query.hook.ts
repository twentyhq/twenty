import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type SystemWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { AgentProfileResolverService } from 'src/modules/agent-profile/services/agent-profile-resolver.service';
import { enrichPolicyAfterSave } from 'src/modules/policy/utils/enrich-policy-after-save.util';
import { getTodayForMember } from 'src/modules/policy/utils/get-today-for-member.util';

@WorkspaceQueryHook({
  key: `policy.createOne`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class PolicyCreateOnePostQueryHook
  implements WorkspacePostQueryHookInstance
{
  constructor(
    private readonly agentProfileResolverService: AgentProfileResolverService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: ObjectRecord[],
  ): Promise<void> {
    const workspace = authContext.workspace;

    if (!isDefined(workspace)) {
      return;
    }

    // Resolve submittedDate and agentId outside workspace context
    let submittedDate: string | undefined;
    let agentProfileId: string | null = null;

    if (isDefined(authContext.workspaceMemberId)) {
      submittedDate = await getTodayForMember(
        workspace.id,
        authContext.workspaceMemberId,
        this.globalWorkspaceOrmManager,
      );

      agentProfileId =
        await this.agentProfileResolverService.resolveAgentProfileId(
          workspace.id,
          authContext.workspaceMemberId,
          authContext,
        );
    }

    const systemAuthContext: SystemWorkspaceAuthContext = {
      type: 'system',
      workspace,
    };

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await enrichPolicyAfterSave(
        payload,
        workspace.id,
        this.globalWorkspaceOrmManager,
        { submittedDate, agentProfileId },
      );
    }, systemAuthContext);
  }
}
