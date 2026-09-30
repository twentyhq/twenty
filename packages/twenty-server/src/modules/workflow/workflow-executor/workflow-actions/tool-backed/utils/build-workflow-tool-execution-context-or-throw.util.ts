import { type PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';
import { getUserFromAuthContext } from 'src/modules/workflow/workflow-executor/utils/get-user-from-auth-context.util';

export const buildWorkflowToolExecutionContextOrThrow = async ({
  executionContext,
  workspaceRunToolContext,
  permissionFlag,
  permissionsService,
}: {
  executionContext: WorkflowExecutionContext;
  workspaceRunToolContext: ToolExecutionContext;
  permissionFlag: PermissionFlagType;
  permissionsService: Pick<PermissionsService, 'hasToolPermission'>;
}): Promise<ToolExecutionContext> => {
  const { application, authContext, rolePermissionConfig } = executionContext;

  if (!isDefined(application)) {
    return workspaceRunToolContext;
  }

  const hasToolPermission = await permissionsService.hasToolPermission(
    rolePermissionConfig,
    workspaceRunToolContext.workspaceId,
    permissionFlag,
  );

  if (!hasToolPermission) {
    throw new WorkflowStepExecutorException(
      `Application "${application.name}" is missing the ${permissionFlag} permission required by this step`,
      WorkflowStepExecutorExceptionCode.FORBIDDEN,
    );
  }

  return {
    ...workspaceRunToolContext,
    ...getUserFromAuthContext(authContext),
    requireConnectedAccountUsableByCaller: true,
  };
};
