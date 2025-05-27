import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { assertWorkflowStatusesNotSetOrEmpty } from 'src/modules/workflow/common/utils/assert-workflow-statuses-not-set-or-empty';

@WorkspaceQueryHook(`workflow.createMany`)
export class WorkflowCreateManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  async execute(
    _authContext: AuthContext,
    _objectName: string,
    payload: CreateManyResolverArgs<WorkflowWorkspaceEntity>,
  ): Promise<CreateManyResolverArgs<WorkflowWorkspaceEntity>> {
    payload.data.forEach((workflow) => {
      assertWorkflowStatusesNotSetOrEmpty(workflow.statuses);
    });

    return payload;
  }
}
