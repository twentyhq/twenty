import { type PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { type WorkflowActionType } from 'twenty-shared/workflow';

import { APPLICATION_WORKFLOW_STEP_PERMISSION_FLAGS } from 'src/modules/workflow/workflow-executor/constants/application-workflow-step-permission-flags.constant';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

// Runs without an application keep the reach of whoever built the workflow
export const assertApplicationRunMayUseStepOrThrow = async ({
  stepType,
  runApplicationId,
  applicationHasPermissionFlag,
}: {
  stepType: WorkflowActionType;
  runApplicationId?: string;
  applicationHasPermissionFlag: ({
    applicationId,
    permissionFlag,
  }: {
    applicationId: string;
    permissionFlag: PermissionFlagType;
  }) => Promise<boolean>;
}): Promise<void> => {
  const permissionFlag = APPLICATION_WORKFLOW_STEP_PERMISSION_FLAGS[stepType];

  if (!isDefined(runApplicationId) || !isDefined(permissionFlag)) {
    return;
  }

  if (
    await applicationHasPermissionFlag({
      applicationId: runApplicationId,
      permissionFlag,
    })
  ) {
    return;
  }

  throw new WorkflowStepExecutorException(
    `This application needs the ${permissionFlag} permission to run ${stepType} steps`,
    WorkflowStepExecutorExceptionCode.FORBIDDEN,
  );
};
