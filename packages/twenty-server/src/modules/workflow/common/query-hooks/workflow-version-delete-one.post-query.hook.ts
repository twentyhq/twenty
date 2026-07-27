import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

@WorkspaceQueryHook({
  key: `workflowVersion.deleteOne`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class WorkflowVersionDeleteOnePostQueryHook
  implements WorkspacePostQueryHookInstance
{
  constructor(
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: WorkflowVersionWorkspaceEntity[],
  ): Promise<void> {
    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.workflowVersionCoreSyncService.deleteCoreVersionsByWorkspaceVersionIds(
      workspace.id,
      payload.map((workflowVersion) => workflowVersion.id),
    );
  }
}
