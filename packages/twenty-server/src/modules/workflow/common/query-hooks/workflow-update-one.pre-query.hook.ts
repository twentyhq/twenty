import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { assertWorkflowStatusesNotSet } from 'src/modules/workflow/common/utils/assert-workflow-statuses-not-set';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

@WorkspaceQueryHook(`workflow.updateOne`)
export class WorkflowUpdateOnePreQueryHook
  implements WorkspaceQueryHookInstance
{
  async execute(
    _authContext: AuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<WorkflowWorkspaceEntity>,
  ): Promise<UpdateOneResolverArgs<WorkflowWorkspaceEntity>> {
    assertWorkflowStatusesNotSet(payload.data.statuses);

    return payload;
  }
}
