import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { UpdateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import {
  WorkflowQueryHookException,
  WorkflowQueryHookExceptionCode,
} from 'src/modules/workflow/common/query-hooks/workflow-query-hook.exception';
import { WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

@WorkspaceQueryHook(`workflowRun.updateMany`)
export class WorkflowRunUpdateManyPreQueryHook
  implements WorkspaceQueryHookInstance
{
  async execute(): Promise<UpdateManyResolverArgs<WorkflowRunWorkspaceEntity>> {
    throw new WorkflowQueryHookException(
      'Method not allowed.',
      WorkflowQueryHookExceptionCode.FORBIDDEN,
    );
  }
}
