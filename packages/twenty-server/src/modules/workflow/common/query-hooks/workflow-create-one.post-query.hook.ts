import { WorkspaceQueryPostHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

@WorkspaceQueryHook({
  key: `workflow.createOne`,
  type: WorkspaceQueryHookType.PostHook,
})
export class WorkflowCreateOnePostQueryHook
  implements WorkspaceQueryPostHookInstance
{
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  async execute(
    _authContext: AuthContext,
    _objectName: string,
    payload: WorkflowWorkspaceEntity[],
  ): Promise<void> {
    const workflow = payload[0];

    const workflowVersionRepository =
      await this.twentyORMManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
      );

    await workflowVersionRepository.insert({
      workflowId: workflow.id,
      status: WorkflowVersionStatus.DRAFT,
      name: 'v1',
    });
  }
}
