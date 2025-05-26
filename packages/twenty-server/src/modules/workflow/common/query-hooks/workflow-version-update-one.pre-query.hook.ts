import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowVersionValidationWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-version-validation.workspace-service';

@WorkspaceQueryHook(`workflowVersion.updateOne`)
export class WorkflowVersionUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly workflowVersionValidationWorkspaceService: WorkflowVersionValidationWorkspaceService,
  ) {}

  async execute(
    _authContext: AuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<WorkflowVersionWorkspaceEntity>,
  ): Promise<UpdateOneResolverArgs<WorkflowVersionWorkspaceEntity>> {
    await this.workflowVersionValidationWorkspaceService.validateWorkflowVersionForUpdateOne(
      payload,
    );

    return payload;
  }
}
