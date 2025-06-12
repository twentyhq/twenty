import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { DeleteOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkflowVersionValidationWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-version-validation.workspace-service';

@WorkspaceQueryHook(`workflowVersion.deleteOne`)
export class WorkflowVersionDeleteOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly workflowVersionValidationWorkspaceService: WorkflowVersionValidationWorkspaceService,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: DeleteOneResolverArgs,
  ): Promise<DeleteOneResolverArgs> {
    const { workspace } = authContext;

    await this.workflowVersionValidationWorkspaceService.validateWorkflowVersionForDeleteOne(
      workspace.id,
      payload,
    );

    return payload;
  }
}
