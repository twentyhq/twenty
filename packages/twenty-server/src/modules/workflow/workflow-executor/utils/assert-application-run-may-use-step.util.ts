import { APPLICATION_WORKFLOW_STEP_PERMISSION_FLAGS } from 'twenty-shared/application';
import { type PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { type WorkflowActionType } from 'twenty-shared/workflow';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

// The application's role is what the workspace granted at install, so it
// decides whether the run may act through a connected account. Runs without an
// application keep the reach of whoever built the workflow.
export const assertApplicationRunMayUseStep = async ({
  stepType,
  runApplicationId,
  applicationHasPermissionFlag,
}: {
  stepType: WorkflowActionType;
  runApplicationId?: string;
  applicationHasPermissionFlag: (
    applicationId: string,
    permissionFlag: PermissionFlagType,
  ) => Promise<boolean>;
}): Promise<void> => {
  const permissionFlag = APPLICATION_WORKFLOW_STEP_PERMISSION_FLAGS[stepType];

  if (!isDefined(runApplicationId) || !isDefined(permissionFlag)) {
    return;
  }

  if (await applicationHasPermissionFlag(runApplicationId, permissionFlag)) {
    return;
  }

  throw new WorkflowStepExecutorException(
    `This application needs the ${permissionFlag} permission to run ${stepType} steps`,
    WorkflowStepExecutorExceptionCode.FORBIDDEN,
  );
};
