import { WorkspaceQueryPostHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

@WorkspaceQueryHook({
  key: `workflow.deleteMany`,
  type: WorkspaceQueryHookType.PostHook,
})
export class WorkflowDeleteManyPostQueryHook
  implements WorkspaceQueryPostHookInstance
{
  constructor(
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: WorkflowWorkspaceEntity[],
  ): Promise<void> {
    this.workflowCommonWorkspaceService.cleanWorkflowsSubEntities(
      payload.map((workflow) => workflow.id),
      authContext.workspace.id,
    );
  }
}
