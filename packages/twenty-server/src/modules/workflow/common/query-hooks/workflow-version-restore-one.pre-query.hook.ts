import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type RestoreOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';

@WorkspaceQueryHook(`workflowVersion.restoreOne`)
export class WorkflowVersionRestoreOnePreQueryHook implements WorkspacePreQueryHookInstance {
  async execute(
    _authContext: WorkspaceAuthContext,
    _objectName: string,
    _payload: RestoreOneResolverArgs,
  ): Promise<RestoreOneResolverArgs> {
    throw new WorkflowQueryValidationException(
      'Method not allowed.',
      WorkflowQueryValidationExceptionCode.FORBIDDEN,
    );
  }
}
