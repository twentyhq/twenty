import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { enrichPolicyAfterSave } from 'src/modules/policy/utils/enrich-policy-after-save.util';

@WorkspaceQueryHook({
  key: `policy.updateMany`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class PolicyUpdateManyPostQueryHook
  implements WorkspacePostQueryHookInstance
{
  constructor(
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

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await enrichPolicyAfterSave(
        payload,
        workspace.id,
        this.globalWorkspaceOrmManager,
      );
    }, authContext as WorkspaceAuthContext);
  }
}
