import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { assertWorkflowStatusesNotSet } from 'src/modules/workflow/common/utils/assert-workflow-statuses-not-set';

@WorkspaceQueryHook(`workflow.updateOne`)
export class WorkflowUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
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
