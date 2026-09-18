import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';
import { assertWorkflowStatusesNotSet } from 'src/modules/workflow/common/utils/assert-workflow-statuses-not-set';

@WorkspaceQueryHook(`workflow.updateOne`)
export class WorkflowUpdateOnePreQueryHook implements WorkspacePreQueryHookInstance {
  async execute(
    _authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<WorkflowWorkspaceEntity>,
  ): Promise<UpdateOneResolverArgs<WorkflowWorkspaceEntity>> {
    assertWorkflowStatusesNotSet(payload.data.statuses);

    if (
      'coreWorkflowId' in payload.data ||
      'lastPublishedVersionId' in payload.data
    ) {
      throw new WorkflowQueryValidationException(
        'Workflow execution links can only be changed through dedicated workflow mutations',
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
      );
    }

    return payload;
  }
}
