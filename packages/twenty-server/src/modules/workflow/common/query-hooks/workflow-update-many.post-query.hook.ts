import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkflowCommandMenuSyncWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-command-menu-sync.workspace-service';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

@WorkspaceQueryHook({
  key: `workflow.updateMany`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class WorkflowUpdateManyPostQueryHook implements WorkspacePostQueryHookInstance {
  constructor(
    private readonly workflowCommandMenuSyncWorkspaceService: WorkflowCommandMenuSyncWorkspaceService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: WorkflowWorkspaceEntity[],
  ): Promise<void> {
    const workflowIds = payload
      .map((workflow) => workflow.id)
      .filter(isDefined);

    await this.workflowCommandMenuSyncWorkspaceService.syncCommandMenuItemLabelForWorkflows(
      workflowIds,
      authContext,
    );
  }
}
