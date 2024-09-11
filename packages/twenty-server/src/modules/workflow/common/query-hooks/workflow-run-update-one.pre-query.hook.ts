import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';
import { WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

@WorkspaceQueryHook(`workflowRun.updateOne`)
export class WorkflowRunUpdateOnePreQueryHook
  implements WorkspaceQueryHookInstance
{
  async execute(): Promise<UpdateOneResolverArgs<WorkflowRunWorkspaceEntity>> {
    throw new WorkflowQueryValidationException(
      'Method not allowed.',
      WorkflowQueryValidationExceptionCode.FORBIDDEN,
    );
  }
}
