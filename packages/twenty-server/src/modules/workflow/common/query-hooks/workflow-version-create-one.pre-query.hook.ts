import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkflowVersionValidationWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-version-validation.workspace-service';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

@WorkspaceQueryHook(`workflowVersion.createOne`)
export class WorkflowVersionCreateOnePreQueryHook
  implements WorkspaceQueryHookInstance
{
  constructor(
    private readonly workflowVersionValidationWorkspaceService: WorkflowVersionValidationWorkspaceService,
  ) {}

  async execute(
    _authContext: AuthContext,
    _objectName: string,
    payload: CreateOneResolverArgs<WorkflowVersionWorkspaceEntity>,
  ): Promise<CreateOneResolverArgs<WorkflowVersionWorkspaceEntity>> {
    await this.workflowVersionValidationWorkspaceService.validateWorkflowVersionForCreateOne(
      payload,
    );

    return payload;
  }
}
