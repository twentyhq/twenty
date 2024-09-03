import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { DeleteOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import {
  WorkflowQueryHookException,
  WorkflowQueryHookExceptionCode,
} from 'src/modules/workflow/common/query-hooks/workflow-query-hook.exception';

@WorkspaceQueryHook(`workflowRun.deleteOne`)
export class WorkflowRunDeleteOnePreQueryHook
  implements WorkspaceQueryHookInstance
{
  async execute(): Promise<DeleteOneResolverArgs> {
    throw new WorkflowQueryHookException(
      'Method not allowed.',
      WorkflowQueryHookExceptionCode.FORBIDDEN,
    );
  }
}
