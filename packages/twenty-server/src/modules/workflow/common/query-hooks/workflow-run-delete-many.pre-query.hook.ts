import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type DeleteManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

@WorkspaceQueryHook(`workflowRun.deleteMany`)
export class WorkflowRunDeleteManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  async execute(): Promise<DeleteManyResolverArgs<WorkflowRunWorkspaceEntity>> {
    throw new WorkflowQueryValidationException(
      'Method not allowed.',
      WorkflowQueryValidationExceptionCode.FORBIDDEN,
    );
  }
}
