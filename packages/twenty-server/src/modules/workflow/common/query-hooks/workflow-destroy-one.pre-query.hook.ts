import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type DestroyOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';

@WorkspaceQueryHook('workflow.destroyOne')
export class WorkflowDestroyOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: DestroyOneResolverArgs,
  ): Promise<DestroyOneResolverArgs> {
    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.workflowCommonWorkspaceService.handleWorkflowSubEntities({
      workflowIds: [payload.id],
      workspaceId: workspace.id,
      operation: 'destroy',
    });

    return payload;
  }
}
